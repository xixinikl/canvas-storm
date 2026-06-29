# CanvasStorm — 任务看板

## 第一阶段：项目骨架

- [x] 1. 创建 package.json（含 Express、ws、dotenv 依赖）
- [x] 2. 创建 .env.example 环境变量模板
- [x] 3. 创建 .gitignore（忽略 node_modules、.env、sessions 数据目录）

## 第二阶段：后端基础

- [x] 4. 创建 server/app.js — Express 入口，加载中间件，启动 HTTP 服务
- [x] 5. 创建 server/storage.js — JSON 文件读写模块（读/写/列出所有会话）
- [x] 6. 创建 server/routes/sessions.js — 会话 REST API（GET 列表、POST 创建、GET 单个、PUT 更新、DELETE 删除）
- [x] 7. 验证后端能启动：npm install 后 node server/app.js 无报错

## 第三阶段：前端对接后端

- [ ] 8. 重构 index.html 中数据读写 —— 优先调用后端 API，失败降级 localStorage
- [ ] 9. 重写保存/加载逻辑：新会话走 POST，切换会话走 GET，更新走 PUT
- [ ] 10. 验证前后端联调：创建会话 → 刷新页面 → 会话仍在

## 第四阶段：WebSocket 实时同步

- [ ] 11. 创建 server/ws.js — WebSocket 服务端（广播节点位置同步）
- [ ] 12. 前端接入 WebSocket —— 拖拽节点时实时广播坐标给同会话的其他客户端
- [ ] 13. 验证多窗口实时同步：打开两个浏览器窗口编辑同一会话，节点位置实时同步

## 第五阶段：用户体验增强

- [ ] 14. 创建 server/routes/export.js — 导出会话为 MD/JSON 文件（后端生成下载）
- [ ] 15. 创建 server/routes/backup.js — 全量备份/恢复所有会话
- [ ] 16. 添加加载状态提示（顶部全局 Loading 条）

## 第六阶段：部署

- [ ] 17. 编写 Procfile 或 Dockerfile（适配 Railway/Render 部署）
- [ ] 18. 部署到 Railway/Render 并验证线上可用
