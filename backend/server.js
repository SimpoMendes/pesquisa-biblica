require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== Modo teste com JSON =====
const ministracoes = require('./ministracoes-teste.json');

// Cache simples
const cache = new Map();
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 3600000);

// Rota para retornar as ministrações
app.get('/ministracoes', (req, res) => {
  res.json(ministracoes);
});

// ===== Rota de busca =====
app.get('/search', async (req, res) => {
  try {
    const keyword = String(req.query.q || '').trim();
    if (!keyword) return res.status(400).json({ error: 'Parâmetro q é obrigatório' });

    // Retorna do cache se existir
    if (cache.has(keyword)) {
      return res.json({ keyword, verses: cache.get(keyword) });
    }

    // Busca no JSON local (modo teste)
    const result = ministracoes[keyword] || [
      { reference: `Ministração sobre "${keyword}"`, text: "Nenhuma ministração disponível para esta palavra." }
    ];

    // Salva no cache
    cache.set(keyword, result);
    setTimeout(() => cache.delete(keyword), CACHE_TTL_MS);

    return res.json({ keyword, verses: result });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Fallback para SPA (qualquer outra rota)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
