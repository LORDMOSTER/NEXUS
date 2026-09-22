const mongoose = require('mongoose');

const examRecordSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true,
    enum: ['CAT-1', 'CAT-2', 'End Semester', 'Quiz']
  },
  academicYear: {
    type: String,
    required: true
  },
  unitsIncluded: {
    type: [Number],
    default: []
  },
  htmlContent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'LOCKED'],
    default: 'LOCKED'
  },
}, { timestamps: true });

module.exports = mongoose.model('ExamRecord', examRecordSchema);
