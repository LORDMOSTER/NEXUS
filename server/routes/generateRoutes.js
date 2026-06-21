const express = require('express');
const router = express.Router();
const axios = require('axios');
const requireAuth = require('../middleware/requireAuth');
const logger = require('../logger');

// ROUTE 1: PART A GENERATION
router.post('/part-a', requireAuth, async (req, res) => {
  const { examType, subjectName, units } = req.body;
  
  let htmlTemplate = `
  <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-family: 'Times New Roman', Times, serif; font-size: 15px; margin-top: 10px;" border="1">
    <tbody class="part-a-body">
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 6px; font-weight: bold; text-align: center;">Part - A (Answer All Questions)-10 X 2 = 20 Marks</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; width: 6%;">CO</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; width: 8%;">K1 - K6</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; width: 6%;">Marks</td>
      </tr>`;

  for(let i=1; i<=10; i++) {
      let co = (examType === 'CAT-1') ? (i<=4 ? 'CO1' : (i<=8 ? 'CO2' : 'CO3')) : (i<=4 ? 'CO3' : (i<=8 ? 'CO4' : 'CO5'));
      let kLevel = (i % 2 === 0) ? 'K2' : 'K1';
      htmlTemplate += `
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; width: 5%;">${i}</td>
        <td style="padding: 6px; text-align: justify;">[Generate K1/K2 2-mark question]</td>
        <td style="padding: 6px; text-align: center;">${co}</td>
        <td style="padding: 6px; text-align: center;">${kLevel}</td>
        <td style="padding: 6px; text-align: center;">2</td>
      </tr>`;
  }
  htmlTemplate += `</tbody></table>`;

  try {
    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: "llama3.2:3b",
      messages: [
        { role: "system", content: "You are an expert academic evaluator. Replace [Generate...] with exactly 10 short 2-mark questions based strictly on Bloom's K1/K2 levels. Output ONLY the filled HTML table." },
        { role: "user", content: `Subject: ${subjectName}. Units: ${units ? units.join(', ') : ''}. Populate this HTML: ${htmlTemplate}` }
      ],
      stream: false,
      options: { temperature: 0.3, num_predict: 2000, repeat_penalty: 1.15 }
    });
    
    let generatedHtml = response.data.message.content.replace(/```html\n?/gi, '').replace(/```\n?/gi, '').trim();
    return res.status(200).json({ success: true, html: generatedHtml });
  } catch (error) {
    logger.error('Part A Generation Failed:', error);
    return res.status(500).json({ success: false, error: "Part A Generation Failed" });
  }
});

// ROUTE 2: PART B & C GENERATION
router.post('/part-b', requireAuth, async (req, res) => {
  const { examType, subjectName, units } = req.body;
  let bMarks = examType === 'CAT-1' ? 16 : 13;
  let bTotal = 5 * bMarks;
  
  let htmlTemplate = `
  <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-family: 'Times New Roman', Times, serif; font-size: 15px; margin-top: 10px;" border="1" class="part-b-table">
    <tbody class="part-b-body">
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Part - B (Answer All Questions)-5 X ${bMarks} = ${bTotal} Marks</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">CO</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">K1 - K6</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Marks</td>
      </tr>`;

  for(let i=11; i<=15; i++) {
      let co = (examType === 'CAT-1') ? (i<=12 ? 'CO1' : (i<=14 ? 'CO2' : 'CO3')) : (i<=12 ? 'CO3' : (i<=14 ? 'CO4' : 'CO5'));
      let kLevel = (i % 2 === 0) ? 'K4' : 'K3';
      htmlTemplate += `
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; width: 5%;">${i}(a)</td>
        <td style="padding: 6px; text-align: justify;">[Generate K3/K4 long question]</td>
        <td style="padding: 6px; text-align: center;">${co}</td>
        <td style="padding: 6px; text-align: center;">${kLevel}</td>
        <td style="padding: 6px; text-align: center;">${bMarks}</td>
      </tr>
      <tr style="page-break-inside: avoid;"><td colspan="5" style="padding: 2px; text-align: center; font-weight: bold; background-color: #fcfcfc;">OR</td></tr>
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center;">${i}(b)</td>
        <td style="padding: 6px; text-align: justify;">[Generate K3/K4 alternative question]</td>
        <td style="padding: 6px; text-align: center;">${co}</td>
        <td style="padding: 6px; text-align: center;">${kLevel}</td>
        <td style="padding: 6px; text-align: center;">${bMarks}</td>
      </tr>`;
  }
  
  if (examType !== 'CAT-1') {
      htmlTemplate += `
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Part - C (Answer All Questions)-1 X 15 = 15 Marks</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">CO</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">K1 - K6</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Marks</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center;">16(a)</td>
        <td style="padding: 6px; text-align: justify;">[Generate K5/K6 Case Study]</td>
        <td style="padding: 6px; text-align: center;">CO5</td>
        <td style="padding: 6px; text-align: center;">K5</td>
        <td style="padding: 6px; text-align: center;">15</td>
      </tr>
      <tr style="page-break-inside: avoid;"><td colspan="5" style="padding: 2px; text-align: center; font-weight: bold; background-color: #fcfcfc;">OR</td></tr>
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center;">16(b)</td>
        <td style="padding: 6px; text-align: justify;">[Generate K5/K6 alternative Case Study]</td>
        <td style="padding: 6px; text-align: center;">CO5</td>
        <td style="padding: 6px; text-align: center;">K5</td>
        <td style="padding: 6px; text-align: center;">15</td>
      </tr>`;
  }
  htmlTemplate += `</tbody></table>`;

  try {
    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: "llama3.2:3b",
      messages: [
        { role: "system", content: "You are an expert academic evaluator. Replace [Generate...] with highly analytical Part B and Part C questions based strictly on Bloom's K3/K4/K5 levels. Output ONLY the filled HTML table." },
        { role: "user", content: `Subject: ${subjectName}. Units: ${units ? units.join(', ') : ''}. Populate this HTML: ${htmlTemplate}` }
      ],
      stream: false,
      options: { temperature: 0.35, num_predict: 3500, repeat_penalty: 1.15 }
    });
    
    let generatedHtml = response.data.message.content.replace(/```html\n?/gi, '').replace(/```\n?/gi, '').trim();
    return res.status(200).json({ success: true, html: generatedHtml });
  } catch (error) {
    logger.error('Part B Generation Failed:', error);
    return res.status(500).json({ success: false, error: "Part B Generation Failed" });
  }
});

// ROUTE 3: CONVERSATIONAL & TARGETED MODIFICATION
router.post('/chat/modify', async (req, res) => {
  const { prompt, selectedText, context } = req.body;
  
  const systemPrompt = `You are a helpful academic AI assistant. The teacher is asking you to modify a specific part of an exam paper or answering a question.
  CURRENT SELECTION: "${selectedText || 'No text selected.'}"
  DOCUMENT CONTEXT: "${context || 'Empty document.'}"
  
  YOUR TASK: Respond with a strict JSON object containing two keys:
  1. "chatMessage": Your conversational response to the teacher.
  2. "htmlUpdate": The specific HTML to inject or replace the selection with. If no document modification is needed, leave this as an empty string "".`;

  try {
    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: "llama3.2:3b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      format: "json",
      stream: false,
      options: { temperature: 0.2, num_predict: 1000 }
    });
    
    const aiData = JSON.parse(response.data.message.content);
    return res.status(200).json({ success: true, chatMessage: aiData.chatMessage, htmlUpdate: aiData.htmlUpdate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Chat modification failed." });
  }
});

module.exports = router;
