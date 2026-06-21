require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db');

const seedUsers = async () => {
  try {
    await connectDB();

    console.log('Clearing existing users...');
    await User.deleteMany({});

    console.log('Hashing passwords and preparing seed data...');
    const saltRounds = 10;
    
    const teachers = [
      {
        structuredId: '7321CSE001',
        passcode: 'Auth@CSE01',
        role: 'Faculty'
      },
      {
        structuredId: '7321CSE002',
        passcode: 'Auth@CSE02',
        role: 'Faculty'
      },
      {
        structuredId: '7321CSE003',
        passcode: 'Auth@CSE03',
        role: 'Faculty'
      }
    ];

    const usersToInsert = await Promise.all(
      teachers.map(async (teacher) => {
        const passwordHash = await bcrypt.hash(teacher.passcode, saltRounds);
        return {
          structuredId: teacher.structuredId,
          passwordHash,
          role: teacher.role
        };
      })
    );

    console.log('Inserting seed users...');
    await User.insertMany(usersToInsert);

    console.log('Successfully seeded database!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
