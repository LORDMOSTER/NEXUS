const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const ExamRecord = require('./models/ExamRecord');
const logger = require('./logger');

const seedUsersData = [
  { structuredId: '7321CSE001', passcode: 'Auth@CSE01', role: 'Faculty' },
  { structuredId: '7321CSE002', passcode: 'Auth@CSE02', role: 'Faculty' },
  { structuredId: '7321CSE003', passcode: 'Auth@CSE03', role: 'Faculty' }
];

const seedSubjectsData = [
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3351', subjectName: 'Digital Principles and Computer Organization', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3451', subjectName: 'Introduction to Operating Systems', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3491', subjectName: 'Artificial Intelligence and Machine Learning', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3591', subjectName: 'Computer Networks', regulationYear: '2021' }
];

const seedExamsData = [
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3351', subjectName: 'Digital Principles and Computer Organization', examType: 'CAT-1', unitsIncluded: [1, 2], status: 'Locked' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', examType: 'CAT-2', unitsIncluded: [3, 4, 5], status: 'Draft' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3451', subjectName: 'Introduction to Operating Systems', examType: 'End Semester', unitsIncluded: [1, 2, 3, 4, 5], status: 'Locked' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3491', subjectName: 'Artificial Intelligence and Machine Learning', examType: 'Quiz', unitsIncluded: [1, 3], status: 'Draft' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3591', subjectName: 'Computer Networks', examType: 'CAT-1', unitsIncluded: [1, 2], status: 'Locked' }
];

const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('No users found. Auto-seeding users...');
      const saltRounds = 10;
      const usersToInsert = await Promise.all(
        seedUsersData.map(async (teacher) => {
          const passwordHash = await bcrypt.hash(teacher.passcode, saltRounds);
          return {
            structuredId: teacher.structuredId,
            passwordHash,
            role: teacher.role
          };
        })
      );
      await User.insertMany(usersToInsert);
      logger.info('Users auto-seeded successfully.');
    }

    const subjectCount = await Subject.countDocuments();
    if (subjectCount === 0) {
      logger.info('No subjects found. Auto-seeding subjects...');
      await Subject.insertMany(seedSubjectsData);
      logger.info('Subjects auto-seeded successfully.');
    }

    const examCount = await ExamRecord.countDocuments();
    if (examCount === 0) {
      logger.info('No exam records found. Auto-seeding exams...');
      await ExamRecord.insertMany(seedExamsData);
      logger.info('Exams auto-seeded successfully.');
    }
  } catch (error) {
    logger.error('Error during auto-seeding:', error);
  }
};

module.exports = autoSeed;
