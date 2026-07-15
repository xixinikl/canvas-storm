// CanvasStorm — Express 入口
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 静态文件：前端页面
app.use(express.static(path.join(__dirname, '..')));

// 路由
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/storm', require('./routes/storm'));
app.use('/api/layout', require('./routes/layout'));
app.use('/api/users', require('./routes/users'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 本地开发页面版本：前端用于发现 index.html 变化后自动刷新
app.get('/api/app-version', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'index.html');
  try {
    const stat = fs.statSync(indexPath);
    res.json({
      code: 200,
      data: {
        version: `${Math.round(stat.mtimeMs)}-${stat.size}`,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '无法读取页面版本' });
  }
});

// 启动服务
const server = app.listen(PORT, () => {
  console.log(`CanvasStorm 服务已启动 → http://localhost:${PORT}`);
});

// WebSocket 协作通道
require('./ws')(server);
