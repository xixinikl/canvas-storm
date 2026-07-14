# CanvasStorm — MVP-first 功能发散工具

CanvasStorm 面向有项目想法的产品/开发者。用户登录到自己的项目空间后，可以从一个具体项目点开始生成“功能图”：先看到核心 MVP，再选择功能发散方向，沿某个方向继续生成下一层功能，并把有启发的点加入灵感备选库或放到以后再看。

## 仓库身份

| 项目 | 说明 |
|---|---|
| 类型 | 产品仓库：MVP-first 功能发散画布。 |
| 协作关系 | 由 `xixi-dev-system` 接入和检查；质量结论可供 `quality-hub` 展示。 |
| 当前状态 | 使用中；当前重构进度见 `CURRENT_STATUS.md`、`GOAL_MVP_FIRST_REFACTOR.md` 和 `PR_PLAN.md`。 |
| 新电脑恢复 | `git clone` 后运行 `~/.codex/bin/xixi-dev-system doctor --project .`，再按下方本地启动。 |

不同产品保持独立视觉，本仓库不继承 Quality Hub 或其他项目的页面风格。

## 当前产品形态

- **本地登录 / 用户空间**：输入不同用户名会看到不同项目记录；登录页会显示最近项目空间，可一键继续上次记录。
- **项目记录**：每个用户有自己的项目列表，默认内置“线上衣橱”“AI 旅行打包助手”和“AI 简历优化助手”；项目会同步到后端 JSON 文件存储，前端保留 localStorage 兜底。
- **MVP-first 首屏**：工作台先展示核心 MVP 和功能发散方向，用户点击方向才进入下一层。
- **清晰交互语义**：“补充这一层”只补当前同层；“进入下一层”只由点击方向/子功能卡片触发。
- **图形化发散**：主界面是功能节点图，长说明集中到详情区和导出内容中。
- **灵感备选库**：每个节点可加入备选库或放到以后再看，支持保存、刷新恢复和 Markdown 导出。
- **AI + 本地降级**：配置 DeepSeek 时调用真实 AI；未配置或失败时使用本地示例，保证流程可演示。

## 快速启动

```bash
npm install
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
npm start
```

打开：

```text
http://127.0.0.1:3000
```

不要直接打开 `file://.../index.html`。完整功能必须通过本地服务访问。

## 验收路径

1. 进入页面，输入用户名进入工作台。
2. 查看默认“线上衣橱”项目的核心 MVP 和发散方向。
3. 点击某个方向进入它的下一层。
4. 点击“生成子功能”，再从子功能列表选择“建议进入”或其他子功能。
5. 点击“加入备选库”或“以后再看”，确认灵感备选库同步变化。
6. 点击“导出”，确认 Markdown 包含核心 MVP、发散方向、灵感备选库、以后再看和功能图。
7. 退出或刷新后重新进入同一用户名，项目记录应保留。

## 测试

```bash
npm test
```

覆盖：

- HTML 内联脚本语法
- REST API、AI 状态接口和用户项目空间 API
- WebSocket 房间广播与断连清理
- 前端功能图主流程：登录、用户隔离、项目记录、方向选择、节点发散、加入备选库、以后再看、持久化和导出
- MVP-first 数据结构：`mvp`、`directions`、`decisions`、旧项目迁移和 AI/fallback 输出契约

GitHub Actions workflow 仍受当前 token 权限边界影响；如需新增/修改 workflow，需要使用带 `workflow` scope 的 GitHub token。

## 技术结构

```text
index.html                  单文件前端 SPA
server/app.js               Express 入口，静态服务、API、WebSocket
server/routes/storm.js      DeepSeek AI 代理和配置状态接口
server/routes/sessions.js   旧会话 CRUD API
server/routes/users.js      用户项目空间 API，按用户名保存功能图项目
server/ws.js                WebSocket 房间广播
tests/                      API / WS / 前端数据流测试
quality/                    Quality Hub 使用的质量报告数据
```

## 当前边界

- 登录是本地演示登录，按用户名隔离项目记录；还不是生产认证。
- 项目和功能图已支持后端 JSON 文件存储，并保留浏览器 localStorage 兜底；后续可迁移到数据库和正式账号体系。
- 真实 AI 输出链路已验证，但输出质量仍需要继续按真实项目打磨 prompt。
- 视觉验收使用 Playwright 完成；截图保存在本地 `output/playwright/`，该目录不作为交付源码。
