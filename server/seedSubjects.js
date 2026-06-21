require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const connectDB = require('./db');

const seedData = [
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3351', subjectName: 'Digital Principles and Computer Organization', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3451', subjectName: 'Introduction to Operating Systems', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3491', subjectName: 'Artificial Intelligence and Machine Learning', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3591', subjectName: 'Computer Networks', regulationYear: '2021' }
];

const seedSubjects = async () => {
  try {
    await connectDB();
    console.log('Clearing existing subjects...');
    await Subject.deleteMany({});
    
    console.log('Inserting seed subjects...');
    await Subject.insertMany(seedData);
    
    console.log('Successfully seeded subjects database!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subjects:', error);
    process.exit(1);
  }
};

seedSubjects();
