const express = require('express');
const router = express.Router();
const ExamRecord = require('../models/ExamRecord');
const requireAuth = require('../middleware/requireAuth');

// Apply auth middleware to all routes in this router
router.use(requireAuth);

// GET /api/exams - Fetch exams for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { structuredId } = req.user;
    
    // Strict isolation query by teacherId
    const exams = await ExamRecord.find({
      teacherId: structuredId
    }).sort({ createdAt: -1 });

    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exam records' });
  }
});

// DELETE /api/exams/:id - Delete an exam record
router.delete('/:id', async (req, res) => {
  try {
    const { structuredId } = req.user;
    
    const exam = await ExamRecord.findOneAndDelete({
      _id: req.params.id,
      teacherId: structuredId
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or you are not authorized to delete it.' });
    }

    // Also delete from Neo4j
    try {
      const { getNeo4jSession } = require('../neo4j');
      const session = getNeo4jSession();
      await session.run(`
        MATCH (e:Exam {mongoId: $examId})
        DETACH DELETE e
      `, { examId: req.params.id });
      await session.close();
    } catch (neoErr) {
      console.error("Neo4j Delete Error:", neoErr);
    }

    res.json({ success: true, message: 'Exam record deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Failed to delete exam record' });
  }
});

module.exports = router;
