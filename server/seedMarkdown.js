const fs = require('fs');

function parseMarkdownSyllabus(filePaths) {
  const subjects = [];

  filePaths.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: Markdown file not found at ${filePath}`);
      return;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    let currentCourse = null;
    let unitCount = 1;

    data.split('\n').forEach(line => {
      // Match Course Code and Name: "### CS3351 - Digital Principles"
      const courseMatch = line.match(/^###\s+([A-Z]{2,4}[0-9]{3,4})\s*-\s*(.*)/);
      
      if (courseMatch) {
        currentCourse = {
          subjectCode: courseMatch[1].trim(),
          subjectName: courseMatch[2].trim(),
          syllabus: []
        };
        subjects.push(currentCourse);
        unitCount = 1; // reset unit count for new course
      } 
      else if (currentCourse) {
        // Match Unit Title and Text: "*   **UNIT I - TITLE:** Text..."
        // Or sometimes it's just plain if there's variations, but based on the file this works
        const unitMatch = line.match(/^\*\s+\*\*UNIT\s+[A-ZIVX]+\s*-\s*(.*?):\*\*\s*(.*)/);
        
        if (unitMatch) {
          // If we already have 5 units, skip (just in case)
          if (unitCount <= 5) {
            currentCourse.syllabus.push({
              unitNumber: unitCount++,
              title: unitMatch[1].trim(),
              text: unitMatch[2].trim(),
              ocrText: '' // leave blank for now
            });
          }
        }
      }
    });
  });

  return subjects;
}

module.exports = { parseMarkdownSyllabus };
