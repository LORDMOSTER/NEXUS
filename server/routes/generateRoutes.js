const express = require('express');
const router = express.Router();
const axios = require('axios');
const requireAuth = require('../middleware/requireAuth');
const logger = require('../logger');

// ─── Helper: strip bold/strong tags from question text cells only ─────────────
function stripBoldFromQuestions(html) {
  return html
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '$1')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '$1');
}

// ─── Format error details into a single loggable string ──────────────────────
function formatError(error) {
  const base = error?.message || String(error);
  // Capture axios response body if present (e.g., 401 Unauthorized from NVIDIA)
  if (error?.response) {
    const status = error.response.status;
    const body = JSON.stringify(error.response.data);
    return `${base} | HTTP ${status} | Body: ${body}`;
  }
  return base || '(no error message — check if process.env.NVIDIA_API_KEY is loaded)';
}

// ─── Unified AI caller ────────────────────────────────────────────────────────
// Supports 'ollama' (local phi4-mini) and 'nvidia' (Nemotron 3 Ultra cloud API)
// Returns: { content: string }
async function callAI(messages, opts = {}, provider = 'ollama') {
  if (provider === 'nvidia') {
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
    logger.info(`[callAI] NVIDIA key loaded: ${NVIDIA_API_KEY ? 'YES (length=' + NVIDIA_API_KEY.length + ')' : 'NO — UNDEFINED'}`);
    if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'nvapi-your-key-here') {
      throw new Error('NVIDIA_API_KEY is not set in server/.env — restart the server after editing .env');
    }

    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'nvidia/nemotron-3-ultra-550b-a55b',
        messages,
        temperature: opts.temperature ?? 0.2,
        top_p: 0.95,
        max_tokens: opts.max_tokens ?? 4096,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5 min 
      }
    );

    return { content: response.data.choices[0].message.content };

  } else {
    // Default: Ollama local
    const response = await axios.post(
      'http://127.0.0.1:11434/api/chat',
      {
        model: 'phi4-mini',
        messages,
        format: opts.format,
        stream: false,
        options: {
          temperature: opts.temperature ?? 0.2,
          num_predict: opts.num_predict ?? 3000,
          repeat_penalty: opts.repeat_penalty ?? 1.1,
          num_ctx: opts.num_ctx ?? 4096
        }
      },
      { timeout: 120000 }
    );

    return { content: response.data.message.content };
  }
}

// ─── BTL Level mapping (Bloom's Taxonomy Labels) ──────────────────────────────
// K1=R, K2=U, K3=AP, K4=AN, K5=E, K6=C
// Part A uses R & U only. Part B uses AP & AN. Part C uses E & C.

const examSystemPrompt = `You are a strict, traditional examination paper setter for undergraduate engineering students (B.E./B.Tech) at Anna University. Your sole task is to generate standard, previous-year-style exam questions that perfectly match the provided Bloom's Taxonomy levels.

CRITICAL RULES TO PREVENT OVER-COMPLICATION:
1. PART A (2 MARKS) STRICT LIMIT: These must be extremely short, single-task questions. Maximum 10 words. Use simple prompts: "Define X.", "List any two Y.", "What is Z?". NEVER combine tasks. Do NOT write "Define X and explain Y." 
2. PART B/C (13/16 MARKS) STRICT LIMIT: Keep the question broad and let the student provide the detail. Maximum 1 to 2 sentences. DO NOT list specific constraints or sub-requirements. 
   - BAD: "Write a React app fetching from an API, handling loading states, using CSS grid, and passing a callback."
   - GOOD: "Explain the React component lifecycle and illustrate how to fetch data from an API with a suitable example."
3. NO MINI-PROJECTS: Do not ask for complete applications, file structures (like package.json), or production-level validation. Keep coding questions to basic, conceptual textbook examples.
4. TONE: Mimic the standard, direct tone of Anna University. Use standard action verbs: Define, State, Explain, Discuss, Illustrate, Compare.
5. FORMATTING: Return ONLY the raw HTML table. Do not include markdown wrappers like \`\`\`html, greetings, or conversational text. Replace the placeholders exactly as requested.`;

// ROUTE 1: PART A GENERATION
router.post('/part-a', requireAuth, async (req, res) => {
  const { examType, subjectName, units, aiProvider } = req.body;
  const provider = 'nvidia';

  let htmlTemplate = `
  <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-family: 'Times New Roman', Times, serif; font-size: 15px; margin-top: 10px; table-layout: fixed;" border="1">
    <colgroup>
      <col style="width: 5%;">
      <col style="width: 65%;">
      <col style="width: 8%;">
      <col style="width: 8%;">
      <col style="width: 7%;">
    </colgroup>
    <tbody class="part-a-body">
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 6px; font-weight: bold; text-align: center;">Part - A (Answer All Questions)-10 X 2 = 20 Marks</td>
        <td style="padding: 6px; font-weight: bold; text-align: center;">CO</td>
        <td style="padding: 6px; font-weight: bold; text-align: center;">BTL</td>
        <td style="padding: 6px; font-weight: bold; text-align: center;">Marks</td>
      </tr>`;

  for (let i = 1; i <= 10; i++) {
    let co;
    if (examType === 'CAT-1') {
      co = i <= 4 ? 'CO1' : (i <= 8 ? 'CO2' : 'CO3');
    } else if (examType === 'CAT-2') {
      co = i <= 2 ? 'CO3' : (i <= 6 ? 'CO4' : 'CO5');
    } else { // End Semester
      co = i <= 2 ? 'CO1' : (i <= 4 ? 'CO2' : (i <= 6 ? 'CO3' : (i <= 8 ? 'CO4' : 'CO5')));
    }
    let btl = (i % 2 === 0) ? 'U' : 'R';
    htmlTemplate += `
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; font-weight: normal;">${i}</td>
        <td style="padding: 6px; text-align: justify; font-weight: normal; word-wrap: break-word;">[QUESTION_${i}_${btl}]</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${co}</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${btl}</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">2</td>
      </tr>`;
  }
  htmlTemplate += `</tbody></table>`;

  const messages = [
    {
      role: 'system',
      content: examSystemPrompt
    },
    {
      role: 'user',
      content: `Subject: ${subjectName}. Units: ${units ? units.join(', ') : 'all units'}.

Replace all [QUESTION_N_R] and [QUESTION_N_U] placeholders with real exam questions. 
- R = Remembering (define, list, state). 
- U = Understanding (explain, describe).
Fill all 10 rows. Output ONLY the raw HTML table.

${htmlTemplate}`
    }
  ];

  try {
    logger.info(`Part A generation via: ${provider.toUpperCase()}`);
    const result = await callAI(messages, { temperature: 0.2, num_predict: 3000, max_tokens: 3000, repeat_penalty: 1.1, num_ctx: 4096 }, provider);

    let generatedHtml = result.content
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    const tableStart = generatedHtml.indexOf('<table');
    const tableEnd = generatedHtml.lastIndexOf('</table>');
    if (tableStart !== -1 && tableEnd !== -1) {
      generatedHtml = generatedHtml.substring(tableStart, tableEnd + 8);
    }

    generatedHtml = stripBoldFromQuestions(generatedHtml);
    generatedHtml += '\n<div class="page-break"></div>';

    return res.status(200).json({ success: true, html: generatedHtml, provider });
  } catch (error) {
    logger.error(`Part A Generation Failed [${provider}]: ${formatError(error)}`);
    return res.status(500).json({ success: false, error: `Part A Generation Failed via ${provider}: ${error.message}` });
  }
});

// ROUTE 2: PART B GENERATION
router.post('/part-b', requireAuth, async (req, res) => {
  const { examType, subjectName, units, targetMarks, duration, aiProvider } = req.body;
  const provider = 'nvidia';
  let bMarks = examType === 'CAT-1' ? 16 : 13;
  let bTotal = 5 * bMarks;

  let htmlTemplate = `
  <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-family: 'Times New Roman', Times, serif; font-size: 15px; margin-top: 10px; table-layout: fixed;" border="1" class="part-b-table">
    <colgroup>
      <col style="width: 5%;">
      <col style="width: 65%;">
      <col style="width: 8%;">
      <col style="width: 8%;">
      <col style="width: 7%;">
    </colgroup>
    <tbody class="part-b-body">
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Part - B (Answer All Questions)-5 X ${bMarks} = ${bTotal} Marks</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">CO</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">BTL</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Marks</td>
      </tr>`;

  for (let i = 11; i <= 15; i++) {
    let co;
    if (examType === 'CAT-1') {
      co = i <= 12 ? 'CO1' : (i <= 14 ? 'CO2' : 'CO3');
    } else if (examType === 'CAT-2') {
      co = i === 11 ? 'CO3' : (i <= 13 ? 'CO4' : 'CO5');
    } else { // End Semester
      co = i === 11 ? 'CO1' : (i === 12 ? 'CO2' : (i === 13 ? 'CO3' : (i === 14 ? 'CO4' : 'CO5')));
    }
    let btl = (i % 2 === 0) ? 'AN' : 'AP';
    htmlTemplate += `
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; font-weight: normal;">${i}(a)</td>
        <td style="padding: 6px; text-align: justify; font-weight: normal; word-wrap: break-word;">[QUESTION_${i}a_${btl}]</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${co}</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${btl}</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${bMarks}</td>
      </tr>
      <tr style="page-break-inside: avoid;"><td colspan="5" style="padding: 2px; text-align: center; font-weight: bold; background-color: #fcfcfc;">OR</td></tr>
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; font-weight: normal;">${i}(b)</td>
        <td style="padding: 6px; text-align: justify; font-weight: normal; word-wrap: break-word;">[QUESTION_${i}b_${btl}]</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${co}</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${btl}</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">${bMarks}</td>
      </tr>`;
  }

  if (examType !== 'CAT-1') {
    htmlTemplate += `
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Part - C (Answer All Questions)-1 X 15 = 15 Marks</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">CO</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">BTL</td>
        <td style="padding: 6px; font-weight: bold; text-align: center; border-top: 2px solid black;">Marks</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; font-weight: normal;">16(a)</td>
        <td style="padding: 6px; text-align: justify; font-weight: normal; word-wrap: break-word;">[QUESTION_16a_E]</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">CO5</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">E</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">15</td>
      </tr>
      <tr style="page-break-inside: avoid;"><td colspan="5" style="padding: 2px; text-align: center; font-weight: bold; background-color: #fcfcfc;">OR</td></tr>
      <tr style="page-break-inside: avoid;">
        <td style="padding: 6px; text-align: center; font-weight: normal;">16(b)</td>
        <td style="padding: 6px; text-align: justify; font-weight: normal; word-wrap: break-word;">[QUESTION_16b_C]</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">CO5</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">C</td>
        <td style="padding: 6px; text-align: center; font-weight: normal;">15</td>
      </tr>`;
  }
  htmlTemplate += `</tbody></table>`;

  const messages = [
    {
      role: 'system',
      content: examSystemPrompt
    },
    {
      role: 'user',
      content: `Subject: ${subjectName}. Units: ${units ? units.join(', ') : 'all units'}.

Replace ALL placeholders in the HTML table below with real exam questions:
- AP = Applying (${bMarks} marks). ${bMarks === 13 ? 'Format: "(i) Sub-topic (7 Marks) <br> (ii) Sub-topic (6 Marks)"' : 'Format: Comprehensive or (8+8 Marks)'}.
- AN = Analyzing (${bMarks} marks). Same format.
- E = Evaluating (15 marks case study).
- C = Creating (15 marks design challenge).
(a) and (b) options must be distinctly different questions. Fill all rows. Output ONLY the raw HTML table.

${htmlTemplate}`
    }
  ];

  try {
    logger.info(`Part B/C generation via: ${provider.toUpperCase()}`);
    const result = await callAI(messages, { temperature: 0.2, num_predict: 4500, max_tokens: 4096, repeat_penalty: 1.1, num_ctx: 4096 }, provider);

    let generatedHtml = result.content
      .replace(/```html\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    const tableStart = generatedHtml.indexOf('<table');
    const tableEnd = generatedHtml.lastIndexOf('</table>');
    if (tableStart !== -1 && tableEnd !== -1) {
      generatedHtml = generatedHtml.substring(tableStart, tableEnd + 8);
    }

    generatedHtml = stripBoldFromQuestions(generatedHtml);

    return res.status(200).json({ success: true, html: generatedHtml, provider });
  } catch (error) {
    logger.error(`Part B Generation Failed [${provider}]: ${formatError(error)}`);
    return res.status(500).json({ success: false, error: `Part B Generation Failed via ${provider}: ${error.message}` });
  }
});

// ROUTE 3: CONVERSATIONAL & TARGETED MODIFICATION
router.post('/chat/modify', async (req, res) => {
  const { prompt, selectedText, context, aiProvider } = req.body;
  const provider = 'nvidia';

  const systemPrompt = `You are a helpful academic AI assistant. The teacher is asking you to modify a specific part of an exam paper or answering a question.
  CURRENT SELECTION: "${selectedText || 'No text selected.'}"
  DOCUMENT CONTEXT: "${context || 'Empty document.'}"
  
  YOUR TASK: Respond with a strict JSON object containing two keys:
  1. "chatMessage": Your conversational response to the teacher.
  2. "htmlUpdate": The specific HTML to inject or replace the selection with. If no document modification is needed, leave this as an empty string "".`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    // For Ollama: use json format; for NVIDIA: parse JSON from response text
    const opts = provider === 'ollama'
      ? { format: 'json', temperature: 0.0, num_predict: 1000, num_ctx: 4096 }
      : { temperature: 0.0, max_tokens: 1000 };

    const result = await callAI(messages, opts, provider);

    // Extract JSON — handle cases where NVIDIA wraps it in markdown
    let rawContent = result.content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const aiData = JSON.parse(rawContent);

    return res.status(200).json({ success: true, chatMessage: aiData.chatMessage, htmlUpdate: aiData.htmlUpdate, provider });
  } catch (error) {
    logger.error(`Chat Modify Failed [${provider}]: ${formatError(error)}`);
    return res.status(500).json({ success: false, error: 'Chat modification failed.' });
  }
});


module.exports = router;
