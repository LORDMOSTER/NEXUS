/**
 * Quick standalone test to verify:
 * 1. NVIDIA API key is loaded from .env
 * 2. The NVIDIA NIM endpoint is reachable
 * 3. Ollama is reachable on localhost:11434
 * 
 * Run with: node testApi.js
 */
require('dotenv').config();
const axios = require('axios');

async function testNvidia() {
  console.log('\n=== NVIDIA API TEST ===');
  const key = process.env.NVIDIA_API_KEY;
  console.log('Key found in .env:', key ? `YES (first 15 chars: ${key.substring(0, 15)}...)` : 'NO — UNDEFINED');

  if (!key || key === 'nvapi-your-key-here') {
    console.error('FAILED: No valid NVIDIA_API_KEY in .env');
    return;
  }

  try {
    console.log('Sending test request to NVIDIA NIM...');
    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        model: 'nvidia/nemotron-3-ultra-550b-a55b',
        messages: [{ role: 'user', content: 'Say "test ok" in 3 words.' }],
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 50,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    console.log('SUCCESS! Response:', response.data.choices[0].message.content);
  } catch (err) {
    console.error('FAILED!');
    console.error('  error.message:', err.message);
    console.error('  error.code   :', err.code);
    if (err.response) {
      console.error('  HTTP Status  :', err.response.status);
      console.error('  Response body:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

async function testOllama() {
  console.log('\n=== OLLAMA TEST ===');
  try {
    console.log('Pinging Ollama at http://127.0.0.1:11434...');
    const ping = await axios.get('http://127.0.0.1:11434/', { timeout: 5000 });
    console.log('Ollama is running:', ping.data);

    console.log('Sending test chat...');
    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: 'phi4-mini',
      messages: [{ role: 'user', content: 'Say "test ok" in 3 words.' }],
      stream: false,
      options: { temperature: 0.2, num_predict: 20, num_ctx: 512 }
    }, { timeout: 30000 });
    console.log('SUCCESS! Response:', response.data.message.content);
  } catch (err) {
    console.error('FAILED!');
    console.error('  error.message:', err.message);
    console.error('  error.code   :', err.code);
    if (err.response) {
      console.error('  HTTP Status  :', err.response.status);
      console.error('  Response body:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

(async () => {
  await testNvidia();
  await testOllama();
  console.log('\n=== TEST COMPLETE ===');
})();
