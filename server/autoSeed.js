const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import your models
const User = require('./models/User.js');
const Subject = require('./models/Subject.js');
const ExamRecord = require('./models/ExamRecord.js');
const { initNeo4j, getNeo4jSession, closeNeo4j } = require('./neo4j');

const { parseMarkdownSyllabus } = require('./seedMarkdown');
const path = require('path');
const seedUsersData = [
  { structuredId: '7321CSE001', passcode: 'Auth@CSE01', role: 'Faculty', name: 'Dr. A. Chandrasekar' },
  { structuredId: '7321CSE002', passcode: 'Auth@CSE02', role: 'Faculty', name: 'Prof. Ramesh Kumar' },
  { structuredId: '7321CSE003', passcode: 'Auth@CSE03', role: 'Faculty', name: 'Dr. S. Anita' }
];


const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB securely if not already connected
    if (mongoose.connection.readyState === 0) {
      const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexusobe';
      await mongoose.connect(MONGO_URI);
      console.log('📦 Connected to MongoDB for Seeding...');
    }

    // 2. Seed Users (Only if empty)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding Users...');
      for (let userData of seedUsersData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPasscode = await bcrypt.hash(userData.passcode, salt);
        await User.create({
          structuredId: userData.structuredId,
          role: userData.role,
          name: userData.name,
          passwordHash: hashedPasscode // Fixed to match User schema
        });
      }
      console.log('✅ Users Sealed.');
    } else {
      console.log('⏭️ Users already exist. Skipping.');
    }

    // 3. Clear existing and seed Markdown Subjects
    console.log('Clearing existing Subjects and Exams...');
    // await Subject.deleteMany({}); // Removed as per user request to skip existing
    await ExamRecord.deleteMany({});

    console.log('Parsing Markdown files for Subjects...');
    const filesToParse = [
      path.join(__dirname, 'Syllabus_Sem1_Sem2_Tamil.md'),
      path.join(__dirname, 'Syllabus_Sem3_to_Sem6.md')
    ];
    
    let parsedSubjects = parseMarkdownSyllabus(filesToParse);
    
    // Add default tenantId, departmentCode, regulationYear
    parsedSubjects = parsedSubjects.map(sub => ({
      ...sub,
      tenantId: '7321', // Match the user's structuredId prefix (7321CSE001)
      departmentCode: 'CSE', // Defaulting all to CSE as per user instructions
      regulationYear: '2021'
    }));

    if (parsedSubjects.length > 0) {
      console.log(`Checking ${parsedSubjects.length} Subjects from Markdown...`);
      let insertedCount = 0;
      let updatedCount = 0;
      for (const subjectData of parsedSubjects) {
        const existingSubject = await Subject.findOne({ subjectCode: subjectData.subjectCode });
        if (!existingSubject) {
          await Subject.create(subjectData);
          insertedCount++;
        } else if (!existingSubject.syllabus || existingSubject.syllabus.length === 0) {
          existingSubject.syllabus = subjectData.syllabus;
          await existingSubject.save();
          updatedCount++;
        }
      }
      console.log(`✅ Seeded ${insertedCount} new Subjects. Updated syllabus for ${updatedCount} existing.`);
    } else {
      console.log('⚠️ No subjects parsed from Markdown.');
    }

    // 5. Seed Neo4j (using MERGE for idempotency)
    console.log('Seeding Neo4j Graph Database...');
    let isStandalone = false;
    if (require.main === module) {
      isStandalone = true;
      initNeo4j(); // Init if run directly
    }
    
    // Give it a brief moment to connect if we just called init
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const session = getNeo4jSession();
      
      // Seed Users to Neo4j
      for (const userData of seedUsersData) {
        await session.run(`
          MERGE (u:User {structuredId: $id})
          SET u.role = $role, u.name = $name
        `, { id: userData.structuredId, role: userData.role, name: userData.name });
      }

      // Clear Neo4j Subjects and Exams for fresh slate
      await session.run(`MATCH (n:Subject) DETACH DELETE n`);
      await session.run(`MATCH (e:Exam) DETACH DELETE e`);

      // Seed Subjects to Neo4j
      for (const subjectData of parsedSubjects) {
        await session.run(`
          MERGE (s:Subject {subjectCode: $code})
          SET s.subjectName = $name, s.departmentCode = $dept
        `, { code: subjectData.subjectCode, name: subjectData.subjectName, dept: subjectData.departmentCode });
      }
      
      console.log('✅ Neo4j Graph Sealed.');
      await session.close();
      
      if (isStandalone) {
        await closeNeo4j();
      }
    } catch (neo4jError) {
      console.error('⚠️ Failed to seed Neo4j:', neo4jError.message);
      if (isStandalone) await closeNeo4j();
    }

    console.log('🚀 DATABASE SEEDING COMPLETE & LOCKED.');
    
    // Only exit if run directly from terminal
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ FATAL SEEDING ERROR:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

// Execute the seeder if run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
