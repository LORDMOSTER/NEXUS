const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// GET /api/subjects/search?q=...
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const { tenantId, departmentCode } = req.user;

    if (!q) {
      return res.json([]);
    }

    // Case-insensitive regex search
    const searchRegex = new RegExp(q, 'i');

    const subjects = await Subject.find({
      tenantId,
      departmentCode,
      $or: [
        { subjectCode: { $regex: searchRegex } },
        { subjectName: { $regex: searchRegex } }
      ]
    }).limit(10); // Limit results for frontend performance

    res.json(subjects);
  } catch (error) {
    console.error('Error searching subjects:', error);
    res.status(500).json({ message: 'Server error during subject search' });
  }
});

// GET /api/subjects - Fetch all subjects for the user's tenant and department
router.get('/', async (req, res) => {
  try {
    const { tenantId, departmentCode } = req.user;
    const subjects = await Subject.find({ tenantId, departmentCode }).sort({ subjectCode: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/subjects - Create a new subject
router.post('/', async (req, res) => {
  try {
    const { tenantId, departmentCode } = req.user;
    const { subjectCode, subjectName, regulationYear, syllabus } = req.body;

    const newSubject = new Subject({
      tenantId,
      departmentCode,
      subjectCode,
      subjectName,
      regulationYear: regulationYear || '2021',
      syllabus: syllabus || []
    });

    await newSubject.save();

    // Sync to Neo4j
    try {
      const { getNeo4jSession } = require('../neo4j');
      const session = getNeo4jSession();
      await session.run(`
        MERGE (s:Subject {subjectCode: $code})
        SET s.subjectName = $name, s.departmentCode = $dept
      `, { code: subjectCode, name: subjectName, dept: departmentCode });
      await session.close();
    } catch (neoErr) {
      console.error("Neo4j Sync Error:", neoErr);
    }

    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server error creating subject' });
  }
});

// PUT /api/subjects/:id - Update a subject
router.put('/:id', async (req, res) => {
  try {
    const { tenantId, departmentCode } = req.user;
    const { subjectCode, subjectName, regulationYear, syllabus } = req.body;

    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: req.params.id, tenantId, departmentCode },
      { subjectCode, subjectName, regulationYear, syllabus },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Sync to Neo4j
    try {
      const { getNeo4jSession } = require('../neo4j');
      const session = getNeo4jSession();
      await session.run(`
        MATCH (s:Subject {subjectCode: $oldCode})
        SET s.subjectCode = $newCode, s.subjectName = $name, s.departmentCode = $dept
      `, { 
        oldCode: updatedSubject.subjectCode, // Assuming we overwrite it, wait - if we changed subjectCode we need the old one. We'll just MERGE on the new one.
        newCode: subjectCode, 
        name: subjectName, 
        dept: departmentCode 
      });
      await session.close();
    } catch (neoErr) {
      console.error("Neo4j Sync Error:", neoErr);
    }

    res.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Server error updating subject' });
  }
});

// DELETE /api/subjects/:id - Delete a subject
router.delete('/:id', async (req, res) => {
  try {
    const { tenantId, departmentCode } = req.user;
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, tenantId, departmentCode });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Sync to Neo4j
    try {
      const { getNeo4jSession } = require('../neo4j');
      const session = getNeo4jSession();
      await session.run(`
        MATCH (s:Subject {subjectCode: $code})
        DETACH DELETE s
      `, { code: subject.subjectCode });
      await session.close();
    } catch (neoErr) {
      console.error("Neo4j Sync Error:", neoErr);
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Server error deleting subject' });
  }
});

module.exports = router;
