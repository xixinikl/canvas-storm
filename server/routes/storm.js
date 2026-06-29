// CanvasStorm — DeepSeek 代理路由
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const API_KEY = process.env.DEEPSEEK_API_KEY;
  const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  if (!API_KEY) {
    return res.status(500).json({ code: 500, error: '服务端未配置 API Key' });
  }

  const { systemPrompt, userPrompt, temperature = 0.8, max_tokens = 4096 } = req.body;
  if (!userPrompt) {
    return res.status(400).json({ code: 400, error: '缺少 userPrompt' });
  }

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt || '你是一个创意头脑风暴助手。' },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(resp.status).json({ code: resp.status, error: err });
    }

    const data = await resp.json();
    res.json({ code: 200, data });
  } catch (e) {
    res.status(502).json({ code: 502, error: e.message });
  }
});

module.exports = router;
