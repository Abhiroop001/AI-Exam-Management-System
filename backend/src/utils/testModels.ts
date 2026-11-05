import axios from 'axios';
import { config } from '../config/config';

async function findWorkingModels() {
  console.log('\n--- Checking Gemini Models ---');
  const geminiModels = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
  ];

  for (const m of geminiModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${config.geminiApiKey}`;
      const res = await axios.post(
        url,
        { contents: [{ parts: [{ text: 'Hello, reply with 1 word.' }] }] },
        { timeout: 8000 }
      );
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`✅ Gemini [${m}]: SUCCESS -> "${text?.trim()}"`);
      break;
    } catch (e: any) {
      console.log(`⚠️ Gemini [${m}]: ${e.response?.data?.error?.message || e.message}`);
    }
  }

  console.log('\n--- Checking OpenRouter Free Models ---');
  try {
    const res = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${config.openRouterApiKey}` },
    });
    const freeModels = res.data.data
      .filter((m: any) => m.id.endsWith(':free'))
      .map((m: any) => m.id);
    console.log(`Found ${freeModels.length} free models on OpenRouter:`);
    console.log(freeModels.slice(0, 10));

    // Test the first 2 free models
    for (const fm of freeModels.slice(0, 3)) {
      try {
        const cRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: fm,
            messages: [{ role: 'user', content: 'Say "Ready" in one word.' }],
            max_tokens: 10,
          },
          {
            headers: {
              Authorization: `Bearer ${config.openRouterApiKey}`,
              'HTTP-Referer': 'https://exam-management.local',
              'X-Title': 'Exam AI',
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        console.log(`✅ OpenRouter [${fm}]: SUCCESS -> "${cRes.data?.choices?.[0]?.message?.content?.trim()}"`);
        break;
      } catch (err: any) {
        console.log(`⚠️ OpenRouter [${fm}]: ${err.response?.data?.error?.message || err.message}`);
      }
    }
  } catch (e: any) {
    console.log(`OpenRouter model fetch error: ${e.message}`);
  }
}

findWorkingModels().catch(console.error);

