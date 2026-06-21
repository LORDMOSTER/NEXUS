const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const ExamRecord = require('../models/ExamRecord');

const router = express.Router();

// ROUTE 1: FAST EXPORT & LOCK (Saves to DB + Generates PDF)
router.post('/finalize', async (req, res) => {
  const {
    htmlContent,
    teacherId,
    subjectCode,
    subjectName = "Computer Networks",
    examType = "CAT-1",
    academicYear = "2025-2026"
  } = req.body;

  try {
    // 1. SAVE TO MONGODB — Creates a permanent, locked record
    const newRecord = await ExamRecord.create({
      teacherId: teacherId || "FAC1029",
      subjectCode: subjectCode || "CS3591",
      subjectName: subjectName,
      examType: examType,
      academicYear: academicYear,
      htmlContent: htmlContent,
      status: 'LOCKED'
    });

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
    Do not include pleasantries. Output only the Markdown table.
    
    EXAM HTML:
    ${contentToProcess}`;

    const llmResponse = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: "llama3.2:3b",
      messages: [
        { role: "system", content: "You are an expert academic evaluator. Output ONLY the markdown table." },
        { role: "user", content: prompt }
      ],
      stream: false,
      options: { temperature: 0.3, num_predict: 2000, repeat_penalty: 1.15 }
    });
    
    const answerKey = llmResponse.data.message.content;

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
