require('dotenv').config();
const mongoose = require('mongoose');
const ExamRecord = require('./models/ExamRecord');
const connectDB = require('./db');

const seedData = [
  {
    teacherId: '7321CSE001',
    subjectCode: 'CS3351',
    subjectName: 'Digital Principles and Computer Organization',
    examType: 'CAT-1',
    academicYear: '2025-2026',
    unitsIncluded: [1, 2],
    htmlContent: '<p>Seed data for CS3351 CAT-1</p>',
    status: 'LOCKED'
  },
  {
    teacherId: '7321CSE001',
    subjectCode: 'CS3391',
    subjectName: 'Object Oriented Programming',
    examType: 'CAT-2',
    academicYear: '2025-2026',
    unitsIncluded: [3, 4, 5],
    htmlContent: '<p>Seed data for CS3391 CAT-2</p>',
    status: 'DRAFT'
  },
  {
    teacherId: '7321CSE002',
    subjectCode: 'CS3451',
    subjectName: 'Introduction to Operating Systems',
    examType: 'End Semester',
    academicYear: '2025-2026',
    unitsIncluded: [1, 2, 3, 4, 5],
    htmlContent: '<p>Seed data for CS3451 End Semester</p>',
    status: 'LOCKED'
  },
  {
    teacherId: '7321CSE003',
    subjectCode: 'CS3491',
    subjectName: 'Artificial Intelligence and Machine Learning',
    examType: 'Quiz',
    academicYear: '2025-2026',
    unitsIncluded: [1, 3],
    htmlContent: '<p>Seed data for CS3491 Quiz</p>',
    status: 'DRAFT'
  },
  {
    teacherId: '7321CSE002',
    subjectCode: 'CS3591',
    subjectName: 'Computer Networks',
    examType: 'CAT-1',
    academicYear: '2025-2026',
    unitsIncluded: [1, 2],
    htmlContent: '<p>Seed data for CS3591 CAT-1</p>',
    status: 'LOCKED'
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
