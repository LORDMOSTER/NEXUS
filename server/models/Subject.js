const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true
  },
  departmentCode: {
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
  regulationYear: {
    type: String,
    default: '2021'
  },
  syllabus: [{
    unitNumber: Number,
    title: String,
    text: String,
    ocrText: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
