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

module.exports = router;
