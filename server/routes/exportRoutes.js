const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const ExamRecord = require('../models/ExamRecord');
const { getNeo4jSession } = require('../neo4j');

const router = express.Router();

// ROUTE 1: FAST EXPORT & LOCK (Saves to DB + Generates PDF)
router.post('/finalize', async (req, res) => {
  const { htmlContent, teacherId, subjectCode, subjectName, examType, academicYear } = req.body;

  try {
    // 1. SAVE TO MONGODB — Creates a permanent, locked record
    const newRecord = await ExamRecord.create({
      teacherId: teacherId,
      subjectCode: subjectCode,
      subjectName: subjectName,
      examType: examType,
      academicYear: academicYear,
      htmlContent: htmlContent,
      status: 'LOCKED'
    });

    // 1.5 Sync to Neo4j
    try {
      const session = getNeo4jSession();
      await session.run(`
        MATCH (u:User {structuredId: $teacherId})
        MATCH (s:Subject {subjectCode: $subjectCode})
        MERGE (e:Exam {mongoId: $examId})
        SET e.examType = $examType, e.academicYear = $academicYear, e.status = $status
        MERGE (u)-[:CREATED]->(e)
        MERGE (e)-[:FOR_SUBJECT]->(s)
      `, {
        teacherId,
        subjectCode,
        examId: newRecord._id.toString(),
        examType,
        academicYear,
        status: 'LOCKED'
      });
      await session.close();
    } catch (neoErr) {
      console.error("Neo4j Sync Error:", neoErr);
      // We don't fail the whole request if Neo4j sync fails
    }

    // 2. GENERATE PDF via Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            /* Base Document Settings */
            body { 
              font-family: 'Times New Roman', Times, serif; 
              background-color: white; 
              color: black; 
              padding: 40px 50px;
              margin: 0;
            }
            
            /* SCOPED EDITOR STYLES — only target TipTap content, not the header */
            .tiptap-content table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              margin-bottom: 20px; 
              table-layout: fixed;
            }
            .tiptap-content th, .tiptap-content td { 
              border: 1px solid black; 
              padding: 8px; 
              text-align: left; 
              word-wrap: break-word;
              overflow-wrap: break-word;
            }

            /* Prevent questions from splitting across pages */
            tr { page-break-inside: avoid; }

            /* Hide TipTap UI artifacts */
            .ProseMirror-selectednode { outline: none !important; }
          </style>
        </head>
        <body>
          <!-- Auto-injected Header for PDF Export -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 5px 0; font-size: 24px; text-transform: uppercase;">Anna University Examination</h2>
            <h3 style="margin: 5px 0; font-size: 20px;">${subjectCode} - ${subjectName}</h3>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">
              ${examType} &bull; Academic Year: ${academicYear}
            </p>
          </div>
          
          <div class="tiptap-content">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    await page.setContent(printHtml, { waitUntil: 'networkidle0' });
    const rawPdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return res.status(200).json({
      success: true,
      recordId: newRecord._id,
      pdfBase64: Buffer.from(rawPdfBuffer).toString('base64'),
      message: "Database locked successfully."
    });

  } catch (error) {
    console.error("Export/DB Error:", error);
    return res.status(500).json({ success: false, error: "Export Failed" });
  }
});

// ROUTE 2: GET ALL ARCHIVED RECORDS (for the Archives page)
router.get('/archives', async (req, res) => {
  try {
    const records = await ExamRecord.find({ status: 'LOCKED' }).sort({ createdAt: -1 });

    const formattedRecords = records.map(record => ({
      _id: record._id,
      code: record.subjectCode,
      name: record.subjectName,
      type: record.examType,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));

    return res.status(200).json({ success: true, records: formattedRecords });
  } catch (error) {
    console.error("Fetch Archives Error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch archives" });
  }
});

// ROUTE 3: ON-DEMAND ANSWER KEY SYNTHESIS (called from Archives page)
router.post('/answer-key', async (req, res) => {
  const { examId, htmlContent } = req.body;

  try {
    // If examId provided, try to load from DB first
    let contentToProcess = htmlContent || "No content provided";
    if (examId) {
      const record = await ExamRecord.findById(examId);
      if (record && record.htmlContent) {
        contentToProcess = record.htmlContent;
      }
    }

    const prompt = `You are a strict academic evaluator. I am providing you with the HTML of a college exam paper. 
    Extract the questions and generate a concise, highly accurate tabular Answer Key / Grading Rubric.
    Format your response STRICTLY as a Markdown table with columns: [Q.No | Question Summary | Value Points / Answer Key | Marks Allocation].
    Do not include pleasantries. Output only the Markdown table.
    
    EXAM HTML:
    ${contentToProcess}`;

    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
    if (!NVIDIA_API_KEY) throw new Error("NVIDIA_API_KEY is not set.");

    const llmResponse = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
      model: "nvidia/nemotron-3-ultra-550b-a55b",
      messages: [
        { role: "system", content: "You are an expert academic evaluator. Output ONLY the markdown table." },
        { role: "user", content: prompt }
      ],
      stream: false,
      temperature: 0.3,
      max_tokens: 4096
    }, {
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 300000
    });
    
    const answerKey = llmResponse.data.choices[0].message.content;

    return res.status(200).json({ success: true, answerKey });
  } catch (error) {
    console.error("Ollama Synthesis Error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate rubric." });
  }
});

// ROUTE 4: DOWNLOAD PDF FROM ARCHIVES BY ID
router.get('/download/pdf/:id', async (req, res) => {
  try {
    // 1. Fetch the record from MongoDB
    const record = await ExamRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    // 2. Spin up Puppeteer to build the PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; background-color: white; color: black; padding: 40px 50px; margin: 0; }
            .tiptap-content table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; table-layout: fixed; }
            .tiptap-content th, .tiptap-content td { border: 1px solid black; padding: 8px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; }
            tr { page-break-inside: avoid; }
            .ProseMirror-selectednode { outline: none !important; }
          </style>
        </head>
        <body>
          <!-- Auto-injected Header for PDF Export -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 5px 0; font-size: 24px; text-transform: uppercase;">Anna University Examination</h2>
            <h3 style="margin: 5px 0; font-size: 20px;">${record.subjectCode} - ${record.subjectName}</h3>
            <p style="margin: 5px 0; font-size: 16px; font-weight: bold;">
              ${record.examType} &bull; Academic Year: ${record.academicYear}
            </p>
          </div>
          
          <div class="tiptap-content">${record.htmlContent}</div>
        </body>
      </html>
    `;

    await page.setContent(printHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 3. Stream the PDF to the browser as a downloadable file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${record.subjectCode}_${record.examType}_Exam.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF Download Error:", error);
    res.status(500).json({ success: false, error: "Failed to generate PDF download" });
  }
});

module.exports = router;
