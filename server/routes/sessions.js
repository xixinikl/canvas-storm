// CanvasStorm — 会话 REST API
const express = require('express');
const router = express.Router();
const storage = require('../storage');

// GET /api/sessions — 获取所有会话列表
router.get('/', (req, res) => {
  try {
    const list = storage.listSessions();
    res.json({ code: 200, data: list });
  } catch (e) {
    res.status(500).json({ code: 500, message: '读取会话列表失败' });
  }
});

// POST /api/sessions — 创建新会话
router.post('/', (req, res) => {
  try {
    const { id, name, nodes, edges, createdAt } = req.body;
    if (!id || !name) {
      return res.status(400).json({ code: 400, message: '缺少 id 或 name' });
    }
    const session = { id, name, nodes: nodes || [], edges: edges || [], createdAt: createdAt || new Date().toISOString() };
    storage.saveSession(session);
    res.json({ code: 200, data: session });
  } catch (e) {
    res.status(500).json({ code: 500, message: '创建会话失败' });
  }
});

// GET /api/sessions/:id — 获取单个会话完整数据
router.get('/:id', (req, res) => {
  try {
    const session = storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ code: 404, message: '会话不存在' });
    }
    res.json({ code: 200, data: session });
  } catch (e) {
    res.status(500).json({ code: 500, message: '读取会话失败' });
  }
});

// PUT /api/sessions/:id — 更新会话
router.put('/:id', (req, res) => {
  try {
    const existing = storage.getSession(req.params.id);
    if (!existing) {
      return res.status(404).json({ code: 404, message: '会话不存在' });
    }
    const updated = { ...existing, ...req.body, id: req.params.id };
    storage.saveSession(updated);
    res.json({ code: 200, data: updated });
  } catch (e) {
    res.status(500).json({ code: 500, message: '更新会话失败' });
  }
});

// DELETE /api/sessions/:id — 删除会话
router.delete('/:id', (req, res) => {
  try {
    const ok = storage.deleteSession(req.params.id);
    if (!ok) {
      return res.status(404).json({ code: 404, message: '会话不存在' });
    }
    res.json({ code: 200, message: '已删除' });
  } catch (e) {
    res.status(500).json({ code: 500, message: '删除会话失败' });
  }
});

module.exports = router;
