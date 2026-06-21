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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
