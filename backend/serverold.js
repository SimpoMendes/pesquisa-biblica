// backend/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Cache simples em memória
const cache = new Map();
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 3600000);

app.get('/search', async (req, res) => {
  try {
    const keyword = String(req.query.q || '').trim();
    if (!keyword) return res.status(400).json({ error: 'Parâmetro q é obrigatório' });

    // Retorna cache se existir
    if (cache.has(keyword)) {
      return res.json({ keyword, verses: cache.get(keyword) });
    }

    // Prompt (ajuste se quiser)
    const systemPrompt = `Você é um pastor que gera ministrações bíblicas curtas, acolhedoras e práticas. Use linguagem clara, inclua uma aplicação prática e finalize com uma frase de reflexão.`;
    const userPrompt = `Escreva uma ministração sobre "${keyword}". 2-4 parágrafos, tom encorajador. Finalize com 1 frase de convite/reflexão.`;

    // Chamada para OpenAI (usa fetch nativo do Node 18+)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 700,
        temperature: Number(process.env.TEMPERATURE || 0.7)
      })
    });

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error('OpenAI error:', openaiRes.status, txt);
      return res.status(500).json({ error: 'Erro na OpenAI', details: txt });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content?.trim() || 'Sem conteúdo retornado';

    const result = [{ reference: `Ministração sobre "${keyword}"`, text }];

    // Salva no cache
    cache.set(keyword, result);
    setTimeout(() => cache.delete(keyword), CACHE_TTL_MS);

    return res.json({ keyword, verses: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Fallback: enviar index.html para rotas desconhecidas (útil para SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
