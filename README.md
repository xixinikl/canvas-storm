# CanvasStorm — AI 头脑风暴画布

一个基于浏览器的视觉化头脑风暴工具。输入项目想法，AI（DeepSeek）自动发散生成创新功能点，以思维导图形式呈现，支持拖拽、缩放、聚焦钻取、进一步发散等交互。

## 项目结构

```
canvas-storm/
├── index.html              # 前端全部代码（单文件 SPA）
├── server/
│   ├── app.js              # Express 入口，启动 HTTP + WebSocket
│   ├── storage.js          # JSON 文件读写（会话持久化到 data/ 目录）
│   ├── ws.js               # WebSocket 协作通道（房间广播）
│   └── routes/
│       ├── sessions.js     # 会话 CRUD API
│       ├── storm.js        # AI 发散 API（调用 DeepSeek）
│       └── layout.js       # 自动布局 API（mindmap-layouts）
├── data/                   # 会话数据（JSON 文件，gitignore）
├── scripts/seed.js         # 种子数据注入脚本
├── tests/                  # 测试文件
├── package.json
├── .env                    # 环境变量（API Key、端口，gitignore）
├── launch.command          # macOS 双击启动脚本
├── CURRENT_STATUS.md       # （旧）状态文档
├── TASKS.md                # （旧）任务看板
└── README.md               # 本文档
```

## 快速启动

### 前置条件

- Node.js 18+
- DeepSeek API Key（用于 AI 发散功能）

### 步骤

```bash
cd canvas-storm

# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 DEEPSEEK_API_KEY

# 3. 启动服务
npm start
# 或者在 macOS 上双击 launch.command

# 4. 打开浏览器
# http://localhost:3000
```

## 核心功能

| 功能 | 说明 |
|------|------|
| AI 发散 | 输入项目描述 → DeepSeek 生成创新功能点（支持 4 种发散风格：均衡/激进/实用/简洁） |
| 思维导图 | 节点以树形布局展示，根节点→子节点的层级关系 |
| 拖拽画布 | 空白处拖拽平移，Ctrl+滚轮缩放（12%~300%） |
| 拖拽节点 | 拖拽节点改变位置，自动保存 |
| 节点发散 | 点击非根节点的「↻ 发散」按钮，对该节点继续发散子节点 |
| Focus Drill | 按 → 键聚焦到子节点，按 ← 返回父级，上下箭头同级切换，Esc 全览 |
| 撤回 | 最多 50 步撤消历史 |
| 自动布局 | 点击「整理布局」调用 mindmap-layouts 算法重排所有节点 |
| 导出 MD | 将会话导出为 Markdown 格式 |
| WebSocket | 多窗口协同编辑同一会话（服务器已实现，前端待接入） |

## 技术架构

- **前端**：原生 JavaScript（无框架），Canvas 风格画布（CSS transform 缩放+平移），单文件 SPA（index.html ~1500 行）
- **后端**：Express.js，REST API + WebSocket
- **AI**：DeepSeek Chat API（通过 storm API 路由调用）
- **存储**：JSON 文件（data/ 目录），前端 localStorage 降级

### 前端关键函数速查

| 函数 | 作用 |
|------|------|
| `renderNodes()` | 渲染全部节点到 canvasLayer |
| `renderDivergeOverlays()` | 渲染发散按钮到独立覆盖层（避免画布缩放影响） |
| `renderEdges()` | 渲染 SVG 连线 |
| `renderAll()` | 渲染全部（nodes + edges + overlays） |
| `applyTransform()` | 应用缩放/平移变换 |
| `toggleDivergePanel(nodeId)` | 打开/关闭发散设置面板 |
| `startDivergeNode(nodeId)` | 调用后端 API 进行发散 |
| `launchSession()` | 从输入框触发根节点生成 |
| `focusNode(id)` | Focus Drill 聚焦某个节点 |
| `tidyLayout()` | 调用后端自动布局 |
| `undo()` | 撤消操作 |

### 最新架构变更（2026-07-04）

**发散按钮已从画布层移出**：之前按钮在 `canvasLayer` 内，受 `transform: scale()` 影响导致 hover 失效、尺寸异常。现在按钮在独立的 `#divergeOverlay` 覆盖层中，通过 `positionDivergeForNode()` 手动计算屏幕坐标定位，不受画布缩放影响。

### 数据流

```
用户操作 → 前端状态更新 → saveCurrentSession()
  ↓
PUT /api/sessions/:id → storage.js 写 data/*.json
  ↓
WebSocket 广播给同房间的其他客户端（未完成）
```

## 当前项目状态

### 已完成

- 完整的前端画布交互（渲染/拖拽/缩放/Focus Drill/撤回）
- 后端 REST API（会话 CRUD / AI 发散 / 自动布局）
- JSON 文件持久化
- 发散按钮 UI 重构（独立覆盖层，彻底解决缩放 bug）
- WebSocket 服务端通道（房间/广播）

### 待完成 / 已知问题

| 优先级 | 任务 | 说明 |
|--------|------|------|
| 高 | 前端接入 WebSocket | 多窗口实时协同编辑 |
| 高 | 发散按钮 hover 反馈增强 | 目前 hover 颜色变化偏弱（可加强阴影/缩放效果） |
| 中 | 节点删除/编辑功能完善 | 上下文菜单中部分功能待实现 |
| 中 | 种子数据管理 | 预设的多套种子数据（营销/产品/网站） |
| 低 | 加载状态/错误提示优化 | 网络请求时的 loading 状态不够明显 |
| 低 | 部署到线上 | Railway/Render 等平台部署 |

### API Endpoints

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/sessions` | 列出所有会话 |
| POST | `/api/sessions` | 创建新会话 |
| GET | `/api/sessions/:id` | 获取单个会话 |
| PUT | `/api/sessions/:id` | 更新会话（保存节点/边） |
| DELETE | `/api/sessions/:id` | 删除会话 |
| POST | `/api/storm/diverge` | AI 发散节点 |
| POST | `/api/layout/tidy` | 自动布局 |

### 环境变量

```
DEEPSEEK_API_KEY=sk-xxx    # DeepSeek API Key（必填，AI 发散功能依赖）
PORT=3000                   # 服务端口（默认 3000）
DATA_DIR=./data             # 数据存储目录
```

## 开发建议

1. 修改 `index.html` 后刷新浏览器即可看到效果（服务端用 `express.static` 静态托管）
2. 如果安装了新 npm 包：`npm install` 后重启 `npm start`
3. `.env` 和 `data/` 目录已加入 `.gitignore`，不会提交到仓库
4. 会话数据是纯 JSON，可以直接打开 `data/` 目录下的文件查看和手动编辑
