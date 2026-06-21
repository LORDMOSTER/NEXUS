require('dotenv').config();
const mongoose = require('mongoose');
const ExamRecord = require('./models/ExamRecord');
const connectDB = require('./db');

const seedData = [
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CS3351',
    subjectName: 'Digital Principles and Computer Organization',
    examType: 'CAT-1',
    unitsIncluded: [1, 2],
    status: 'Locked'
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CS3391',
    subjectName: 'Object Oriented Programming',
    examType: 'CAT-2',
    unitsIncluded: [3, 4, 5],
    status: 'Draft'
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CS3451',
    subjectName: 'Introduction to Operating Systems',
    examType: 'End Semester',
    unitsIncluded: [1, 2, 3, 4, 5],
    status: 'Locked'
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CS3491',
    subjectName: 'Artificial Intelligence and Machine Learning',
    examType: 'Quiz',
    unitsIncluded: [1, 3],
    status: 'Draft'
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    examType: 'CAT-1',
    unitsIncluded: [1, 2],
    status: 'Locked'
  }
];

const seedExams = async () => {
  try {
    await connectDB();
    console.log('Clearing existing exam records...');
    await ExamRecord.deleteMany({});
    
    console.log('Inserting seed exam records...');
    await ExamRecord.insertMany(seedData);
    
    console.log('Successfully seeded exam database!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding exams:', error);
    process.exit(1);
  }
};

seedExams();
