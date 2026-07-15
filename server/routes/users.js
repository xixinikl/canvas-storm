// CanvasStorm — 用户项目空间 API
const express = require('express');
const router = express.Router();
const storage = require('../storage');

router.get('/:user/projects', (req, res) => {
  try {
    const projects = storage.getUserProjects(req.params.user);
    res.json({ code: 200, data: { user: req.params.user, projects } });
  } catch (e) {
    res.status(500).json({ code: 500, message: '读取用户项目失败' });
  }
});

router.put('/:user/projects', (req, res) => {
  try {
    const { projects } = req.body || {};
    if (!Array.isArray(projects)) {
      return res.status(400).json({ code: 400, message: 'projects 必须是数组' });
    }
    const saved = storage.saveUserProjects(req.params.user, projects);
    res.json({ code: 200, data: { user: req.params.user, projects: saved } });
  } catch (e) {
    res.status(500).json({ code: 500, message: '保存用户项目失败' });
  }
});

module.exports = router;
