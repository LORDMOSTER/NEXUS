const express = require('express');
const router = express.Router();
const ExamRecord = require('../models/ExamRecord');
const requireAuth = require('../middleware/requireAuth');

// Apply auth middleware to all routes in this router
router.use(requireAuth);

// GET /api/exams - Fetch exams for the logged-in user's tenant and department
router.get('/', async (req, res) => {
  try {
    const { tenantId, departmentCode } = req.user;
    
    // Strict multi-tenant isolation query
    const exams = await ExamRecord.find({
      tenantId,
      departmentCode
    }).sort({ createdAt: -1 });

    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exam records' });
  }
});

module.exports = router;
