// CanvasStorm — Express 入口
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 静态文件：前端页面
app.use(express.static(path.join(__dirname, '..')));

// 路由
app.use('/api/sessions', require('./routes/sessions'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务
const server = app.listen(PORT, () => {
  console.log(`CanvasStorm 服务已启动 → http://localhost:${PORT}`);
});

// WebSocket 协作通道
require('./ws')(server);
