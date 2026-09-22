require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const connectDB = require('./db');

const seedData = [
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3351', subjectName: 'Digital Principles and Computer Organization', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3391', subjectName: 'Object Oriented Programming', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3451', subjectName: 'Introduction to Operating Systems', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3491', subjectName: 'Artificial Intelligence and Machine Learning', regulationYear: '2021' },
  { tenantId: '7321', departmentCode: 'CSE', subjectCode: 'CS3591', subjectName: 'Computer Networks', regulationYear: '2021' },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CY3151',
    subjectName: 'ENGINEERING CHEMISTRY',
    regulationYear: '2021',
    syllabus: [
      {
        unitNumber: 1,
        title: "WATER AND ITS TREATMENT",
        topics: "Water: Sources and impurities, Water quality parameters: Definition and significance of-color, odour, turbidity, pH, hardness, alkalinity, TDS, COD and BOD, fluoride and arsenic. Municipal water treatment: primary treatment and disinfection (UV, Ozonation, break-point chlorination). Desalination of brackish water: Reverse Osmosis. Boiler troubles: Scale and sludge, Boiler corrosion, Caustic embrittlement, Priming & foaming. Treatment of boiler feed water: Internal treatment (phosphate, colloidal, sodium aluminate and calgon conditioning) and External treatment - Ion exchange demineralization and zeolite process."
      },
      {
        unitNumber: 2,
        title: "NANOCHEMISTRY",
        topics: "Basics: Distinction between molecules, nanomaterials and bulk materials; Size-dependent properties (optical, electrical, mechanical and magnetic); Types of nanomaterials: Definition, properties and uses of – nanoparticle, nanocluster, nanorod, nanowire and nanotube. Preparation of nanomaterials: sol-gel, solvothermal, laser ablation, chemical vapour deposition, electrochemical deposition and electro spinning. Applications of nanomaterials in medicine, agriculture, energy, electronics and catalysis."
      },
      {
        unitNumber: 3,
        title: "PHASE RULE AND COMPOSITES",
        topics: "Phase rule: Introduction, definition of terms with examples. One component system - water system; Reduced phase rule; Construction of a simple eutectic phase diagram - Thermal analysis; Two component system: lead-silver system - Pattinson process. Composites: Introduction: Definition & Need for composites; Constitution: Matrix materials (Polymer matrix, metal matrix and ceramic matrix) and Reinforcement (fiber, particulates, flakes and whiskers). Properties and applications of: Metal matrix composites (MMC), Ceramic matrix composites and Polymer matrix composites. Hybrid composites - definition and examples."
      },
      {
        unitNumber: 4,
        title: "FUELS AND COMBUSTION",
        topics: "Fuels: Introduction: Classification of fuels; Coal and coke: Analysis of coal (proximate and ultimate), Carbonization, Manufacture of metallurgical coke (Otto Hoffmann method). Petroleum and Diesel: Manufacture of synthetic petrol (Bergius process), Knocking - octane number, diesel oil - cetane number; Power alcohol and biodiesel. Combustion of fuels: Introduction: Calorific value - higher and lower calorific values, Theoretical calculation of calorific value; Ignition temperature: spontaneous ignition temperature, Explosive range; Flue gas analysis - ORSAT Method. CO2 emission and carbon footprint."
      },
      {
        unitNumber: 5,
        title: "ENERGY SOURCES AND STORAGE DEVICES",
        topics: "Stability of nucleus: mass defect (problems), binding energy; Nuclear energy: light water nuclear power plant, breeder reactor. Solar energy conversion: Principle, working and applications of solar cells; Recent developments in solar cell materials. Wind energy; Geothermal energy; Batteries: Types of batteries, Primary battery - dry cell, Secondary battery - lead acid battery and lithium-ion-battery; Electric vehicles - working principles; Fuel cells: H2-O2 fuel cell, microbial fuel cell; Supercapacitors: Storage principle, types and examples."
      }
    ]
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'GE3151',
    subjectName: 'PROBLEM SOLVING AND PYTHON PROGRAMMING',
    regulationYear: '2021',
    syllabus: [
      {
        unitNumber: 1,
        title: "COMPUTATIONAL THINKING AND PROBLEM SOLVING",
        topics: "Fundamentals of Computing – Identification of Computational Problems - Algorithms, building blocks of algorithms (statements, state, control flow, functions), notation (pseudo code, flow chart, programming language), algorithmic problem solving, simple strategies for developing algorithms (iteration, recursion). Illustrative problems: find minimum in a list, insert a card in a list of sorted cards, guess an integer number in a range, Towers of Hanoi."
      },
      {
        unitNumber: 2,
        title: "DATA TYPES, EXPRESSIONS, STATEMENTS",
        topics: "Python interpreter and interactive mode, debugging; values and types: int, float, boolean, string, and list; variables, expressions, statements, tuple assignment, precedence of operators, comments; Illustrative programs: exchange the values of two variables, circulate the values of n variables, distance between two points."
      },
      {
        unitNumber: 3,
        title: "CONTROL FLOW, FUNCTIONS, STRINGS",
        topics: "Conditionals: Boolean values and operators, conditional (if), alternative (if-else), chained conditional (if-elif-else); Iteration: state, while, for, break, continue, pass; Fruitful functions: return values, parameters, local and global scope, function composition, recursion; Strings: string slices, immutability, string functions and methods, string module; Lists as arrays. Illustrative programs: square root, gcd, exponentiation, sum an array of numbers, linear search, binary search."
      },
      {
        unitNumber: 4,
        title: "LISTS, TUPLES, DICTIONARIES",
        topics: "Lists: list operations, list slices, list methods, list loop, mutability, aliasing, cloning lists, list parameters; Tuples: tuple assignment, tuple as return value; Dictionaries: operations and methods; advanced list processing - list comprehension; Illustrative programs: simple sorting, histogram, Students marks statement, Retail bill preparation."
      },
      {
        unitNumber: 5,
        title: "FILES, MODULES, PACKAGES",
        topics: "Files and exceptions: text files, reading and writing files, format operator; command line arguments, errors and exceptions, handling exceptions, modules, packages; Illustrative programs: word count, copy file, Voter's age validation, Marks range validation (0-100)."
      }
    ]
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CCS334',
    subjectName: 'BIG DATA ANALYTICS',
    regulationYear: '2021',
    syllabus: [
      {
        unitNumber: 1,
        title: "INTRODUCTION TO BIG DATA",
        topics: "Evolution of Big data - Best Practices for Big data Analytics - Big data characteristics - Validating - The Promotion of the Value of Big Data - Big Data Use Cases- Characteristics of Big Data Applications - Perception and Quantification of Value -Understanding Big Data Storage - A General Overview of High-Performance Architecture - HDFS - MapReduce and YARN - Map Reduce Programming Model."
      },
      {
        unitNumber: 2,
        title: "CLUSTERING AND CLASSIFICATION",
        topics: "Advanced Analytical Theory and Methods: Overview of Clustering - K-means - Use Cases - Overview of the Method - Determining the Number of Clusters - Diagnostics - Reasons to Choose and Cautions - Classification: Decision Trees - Overview of a Decision Tree - The General Algorithm - Decision Tree Algorithms - Evaluating a Decision Tree - Decision Trees in R - Naïve Bayes - Bayes' Theorem - Naïve Bayes Classifier."
      },
      {
        unitNumber: 3,
        title: "ASSOCIATION AND RECOMMENDATION SYSTEM",
        topics: "Advanced Analytical Theory and Methods: Association Rules - Overview - Apriori Algorithm - Evaluation of Candidate Rules - Applications of Association Rules - Finding Association& finding similarity - Recommendation System: Collaborative Recommendation- Content Based Recommendation - Knowledge Based Recommendation- Hybrid Recommendation Approaches."
      },
      {
        unitNumber: 4,
        title: "STREAM MEMORY",
        topics: "Introduction to Streams Concepts – Stream Data Model and Architecture - Stream Computing, Sampling Data in a Stream – Filtering Streams – Counting Distinct Elements in a Stream – Estimating moments – Counting oneness in a Window – Decaying Window – Real time Analytics Platform(RTAP) applications - Case Studies - Real Time Sentiment Analysis, Stock Market Predictions."
      },
      {
        unitNumber: 5,
        title: "NOSQL DATA MANAGEMENT FOR BIG DATA AND VISUALIZATION",
        topics: "NoSQL Databases : Schema-less Models: Increasing Flexibility for Data Manipulation-Key Value Stores- Document Stores - Tabular Stores - Object Data Stores - Graph Databases Hive - Sharding - Hbase - Analyzing big data with twitter - Big data for E-Commerce Big data for blogs - Review of Basic Data Analytic Methods using R."
      }
    ]
  },
  {
    tenantId: '7321',
    departmentCode: 'CSE',
    subjectCode: 'CCS375',
    subjectName: 'WEB TECHNOLOGIES',
    regulationYear: '2021',
    syllabus: [
      {
        unitNumber: 1,
        title: "WEB TECHNOLOGIES",
        topics: "Internet – Basic Internet Protocols - The World Wide Web- HTTP request message-response message-Web Clients Web Servers. HTML5 – Tables - Lists – Image – HTML5 control elements - Semantic elements – Drag and Drop - Audio - Video controls – CSS3 - Inline, embedded and external style sheets – Rule cascading - Inheritance – Backgrounds - Border Images – Colors - Shadows - Text - Transformations - Transitions - Animations."
      },
      {
        unitNumber: 2,
        title: "CLIENT SIDE PROGRAMMING",
        topics: "Java Script: An introduction to JavaScript-JavaScript DOM Model-Date and Objects-Regular Expressions- Exception Handling-Validation-Built-in objects-Event Handling- DHTML with JavaScript."
      },
      {
        unitNumber: 3,
        title: "SERVER SIDE PROGRAMMING",
        topics: "Servlets: Java Servlet Architecture- Servlet Life Cycle- Form GET and POST actions- Session Handling- Understanding Cookies- Installing and Configuring Apache Tomcat Web Server- DATABASE CONNECTIVITY: JDBC perspectives, JDBC program example - JSP: Understanding Java Server Pages-JSP Standard Tag Library(JSTL)-Creating HTML forms by embedding JSP code."
      },
      {
        unitNumber: 4,
        title: "PHP and XML",
        topics: "An introduction to PHP: PHP- Using PHP- Variables- Program control- Built-in functions-Connecting to Database - Using Cookies-Regular Expressions; XML: Basic XML- Document Type Definition- XML Schema DOM and Presenting XML, XML Parsers and Validation, XSL and XSLT Transformation, News Feed (RSS and ATOM)."
      },
      {
        unitNumber: 5,
        title: "INTRODUCTION TO AJAX and WEB SERVICES",
        topics: "AJAX: Ajax Client Server Architecture-XML Http Request Object-Call Back Methods; Web Services: Introduction- Java web services Basics – Creating, Publishing ,Testing and Describing a Web services (WSDL)-Consuming a web service, Database Driven web service from an application – SOAP."
      }
    ]
  }
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
