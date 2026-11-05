import axios from 'axios';
import Groq from 'groq-sdk';
import { config } from '../config/config';

async function testAllKeys() {
  console.log('\n======================================================');
  console.log('       TESTING ALL UPLOADED API KEYS IN .ENV          ');
  console.log('======================================================\n');

  console.log(`1. GROQ_API_KEY: ${config.groqApiKey ? config.groqApiKey.slice(0, 10) + '...' : 'MISSING'}`);
  console.log(`2. HUGGINGFACE_API_KEY: ${config.huggingFaceApiKey ? config.huggingFaceApiKey.slice(0, 8) + '...' : 'MISSING'}`);
  console.log(`3. GEMINI_API_KEY: ${config.geminiApiKey ? config.geminiApiKey.slice(0, 8) + '...' : 'MISSING'}`);
  console.log(`4. OPENROUTER_API_KEY: ${config.openRouterApiKey ? config.openRouterApiKey.slice(0, 12) + '...' : 'MISSING'}`);
  console.log(`5. MISTRAL_API_KEY: ${config.mistralApiKey ? config.mistralApiKey.slice(0, 10) + '...' : 'MISSING'}\n`);

  // --- TEST 1: GROQ ---
  console.log('--- [1/5] Testing Groq API Key ---');
  if (config.groqApiKey) {
    try {
      const groq = new Groq({ apiKey: config.groqApiKey });
      const testModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant'];
      let groqSuccess = false;
      for (const m of testModels) {
        try {
          const res = await groq.chat.completions.create({
            model: m,
            messages: [{ role: 'user', content: 'Say "Groq is Online" in 3 words.' }],
            max_tokens: 15,
          });
          const ans = res.choices[0]?.message?.content?.trim();
          console.log(`  ✅ Model "${m}": SUCCESS -> "${ans}"`);
          groqSuccess = true;
          break;
        } catch (e: any) {
          console.log(`  ⚠️ Model "${m}": ${e.message}`);
        }
      }
      if (!groqSuccess) console.log('  ❌ Groq all models failed.');
    } catch (err: any) {
      console.log(`  ❌ Groq Init Error: ${err.message}`);
    }
  } else {
    console.log('  ❌ Groq key not set.');
  }

  // --- TEST 2: HUGGING FACE ---
  console.log('\n--- [2/5] Testing Hugging Face API Key ---');
  if (config.huggingFaceApiKey) {
    // 2a. Embeddings / Semantic similarity
    try {
      const hfModel = 'BAAI/bge-large-en-v1.5';
      const endpoints = [
        `https://router.huggingface.co/hf-inference/models/${hfModel}`,
        `https://api-inference.huggingface.co/models/${hfModel}`,
      ];
      let hfSuccess = false;
      for (const ep of endpoints) {
        try {
          const res = await axios.post(
            ep,
            { inputs: ['BFS explores level by level', 'Breadth first search traverses graph level by level'] },
            {
              headers: {
                Authorization: `Bearer ${config.huggingFaceApiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          );
          if (res.data) {
            console.log(`  ✅ Hugging Face BAAI/bge-large-en-v1.5: SUCCESS (Status ${res.status})`);
            hfSuccess = true;
            break;
          }
        } catch (e: any) {
          console.log(`  ⚠️ Endpoint ${ep}: ${e.response?.data?.error || e.message}`);
        }
      }
      if (!hfSuccess) console.log('  ⚠️ BAAI/bge-large-en-v1.5 router fallback active');
    } catch (err: any) {
      console.log(`  ❌ HF Error: ${err.message}`);
    }

    // 2b. Grammar / Text2Text
    try {
      const gModel = 'grammarly/coedit-large';
      const ep = `https://router.huggingface.co/hf-inference/models/${gModel}`;
      const res: any = await axios.post(
        ep,
        { inputs: 'Fix the grammar: what are difference between queue and stack' },
        {
          headers: {
            Authorization: `Bearer ${config.huggingFaceApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      ).catch((e) => ({ data: null, error: e.response?.data?.error || e.message }));

      if (res && res.data) {
        console.log(`  ✅ Hugging Face grammarly/coedit-large: SUCCESS ->`, res.data);
      } else {
        console.log(`  ℹ️ Hugging Face grammarly/coedit-large notice: ${res?.error}`);
      }
    } catch (err: any) {
      console.log(`  ❌ HF Grammar Error: ${err.message}`);
    }
  } else {
    console.log('  ❌ Hugging Face key not set.');
  }

  // --- TEST 3: GOOGLE GEMINI ---
  console.log('\n--- [3/5] Testing Google Gemini Key ---');
  if (config.geminiApiKey) {
    const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let geminiSuccess = false;
    for (const model of geminiModels) {
      try {
        // Try query param key
        const urlParam = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;
        const res = await axios.post(
          urlParam,
          { contents: [{ parts: [{ text: 'Hello, reply with "Gemini is Online"' }] }] },
          { timeout: 10000 }
        );
        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`  ✅ Gemini API (${model} with ?key=): SUCCESS -> "${text?.trim()}"`);
        geminiSuccess = true;
        break;
      } catch (err: any) {
        const msg = err.response?.data?.error?.message || err.message;
        console.log(`  ⚠️ Gemini (${model} query param): ${msg}`);

        // Try Authorization: Bearer key (in case it is an OAuth / Cloud Access token)
        try {
          const urlBearer = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
          const resBearer = await axios.post(
            urlBearer,
            { contents: [{ parts: [{ text: 'Hello, reply with "Gemini is Online"' }] }] },
            {
              headers: { Authorization: `Bearer ${config.geminiApiKey}` },
              timeout: 10000,
            }
          );
          const text = resBearer.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log(`  ✅ Gemini API (${model} with Bearer): SUCCESS -> "${text?.trim()}"`);
          geminiSuccess = true;
          break;
        } catch (errB: any) {
          const msgB = errB.response?.data?.error?.message || errB.message;
          console.log(`  ⚠️ Gemini (${model} Bearer): ${msgB}`);
        }
      }
    }
    if (!geminiSuccess) console.log('  ❌ Gemini API failed with the provided key format.');
  } else {
    console.log('  ❌ Gemini key not set.');
  }

  // --- TEST 4: OPENROUTER ---
  console.log('\n--- [4/5] Testing OpenRouter Key ---');
  if (config.openRouterApiKey) {
    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'user', content: 'Say "OpenRouter is Online" in 3 words.' }],
          max_tokens: 15,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openRouterApiKey}`,
            'HTTP-Referer': 'https://exam-management.local',
            'X-Title': 'Exam Management AI',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      const text = res.data?.choices?.[0]?.message?.content?.trim();
      console.log(`  ✅ OpenRouter: SUCCESS -> "${text}"`);
    } catch (err: any) {
      console.log(`  ❌ OpenRouter Error: ${err.response?.data?.error?.message || err.message}`);
    }
  } else {
    console.log('  ❌ OpenRouter key not set.');
  }

  // --- TEST 5: MISTRAL ---
  console.log('\n--- [5/5] Testing Mistral Key ---');
  if (config.mistralApiKey) {
    try {
      const res = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: 'Say "Mistral is Online" in 3 words.' }],
          max_tokens: 15,
        },
        {
          headers: {
            Authorization: `Bearer ${config.mistralApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      const text = res.data?.choices?.[0]?.message?.content?.trim();
      console.log(`  ✅ Mistral API: SUCCESS -> "${text}"`);
    } catch (err: any) {
      console.log(`  ❌ Mistral Error: ${err.response?.data?.message || err.message}`);
    }
  } else {
    console.log('  ❌ Mistral key not set.');
  }

  console.log('\n======================================================');
  console.log('            API KEY VERIFICATION COMPLETE             ');
  console.log('======================================================\n');
}

testAllKeys().catch(console.error);
