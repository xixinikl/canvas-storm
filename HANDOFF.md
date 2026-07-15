# CanvasStorm 交接文档

更新时间：2026-07-16 02:50（Asia/Shanghai）

## 当前结论

CanvasStorm 现在有两条线：

1. `index.html` 是当前主应用，已经完成 MVP-first 功能图重构，并已把用户确认的 fresh demo 核心体验合入主界面。
2. `concept-fresh-demo.html` 仍保留为设计/产品方向参考样板，方便后续继续对照视觉和信息结构。

这次主应用已迁入的内容包括：顶部栏折叠、导出复制/下载、MVP 与拓展功能的清晰说明、开发前验证、实现难度、预计时间、创新切口、右侧 Agent 开发 Brief、agent-ready Markdown 导出。

## 仓库与分支

- 仓库：`https://github.com/xixinikl/canvas-storm.git`
- 当前分支：`cx/direction-workbench-ci`
- 当前 PR：[#5 feat: CanvasStorm workbench baseline and MVP-first refactor plan](https://github.com/xixinikl/canvas-storm/pull/5)
- PR 目标分支：`main`
- PR 状态：Draft，保持给用户验收，不要未经确认直接合并。
- 最近远端提交：`31cbe64 feat: merge fresh MVP workbench into app`

## 另一个电脑拉取和启动

如果另一台电脑还没有这个项目：

```bash
git clone https://github.com/xixinikl/canvas-storm.git
cd canvas-storm
git checkout cx/direction-workbench-ci
npm install
npm start
```

如果另一台电脑已经 clone 过这个项目：

```bash
cd canvas-storm
git fetch origin
git checkout cx/direction-workbench-ci
git pull --ff-only origin cx/direction-workbench-ci
npm install
npm start
```

确认没有拉错版本：

```bash
git status --short --branch
git log --oneline -3
```

应该看到当前分支是：

```text
cx/direction-workbench-ci
```

最新提交应该包含：

```text
31cbe64 feat: merge fresh MVP workbench into app
```

如需真实 AI：

```bash
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
```

主应用入口：

```text
http://127.0.0.1:3000/
```

参考 demo：

```text
http://127.0.0.1:3000/concept-fresh-demo.html
```

## 这次已合入主应用的体验

主应用文件：`index.html`
参考样板：`concept-fresh-demo.html`

用户已确认 demo 方向后，已迁入主应用：

- 顶部栏可折叠，减少工具区视觉占用。
- 页面视觉更清爽，浅色、留白、柔和边界，不再像重型画布工具。
- 信息结构固定为：
  - 市场问题
  - 最小 MVP
  - 拓展功能池
  - 右侧当前判断
  - 交给 Agent 的开发 Brief
- “验证方式”改为“开发前验证”，并解释它不是技术测试，而是开发前确认用户是否真的需要。
- 每个拓展功能补齐：
  - 实现难度
  - 预计时间
  - 创新切口
  - 开发前验证
  - 可直接交给 agent 的实现 brief
- 导出支持复制 Markdown 和下载 `.md` 文件。
- 导出的 Markdown 不是灵感列表，而是可交给 agent 的开发 brief。

当前 demo 示例项目是“AI 旅行打包助手”。它只是样例内容，不代表产品只能做旅行场景。

## 产品逻辑共识

用户最在意的是：打开后能马上知道要干什么，不要被“保留、发散、进入下一层、继续发散”等相似动作绕晕。

新的产品逻辑应该这样收束：

- MVP 不是普通功能列表，而是“证明核心痛点成立的最小可用版本”。
- 拓展功能和 MVP 可以同属一个方向，但不能重复。
- 拓展功能必须带判断信息：为什么做、难不难、多久、创新点在哪、怎么验证。
- 用户最后很可能把导出内容发给另一个 agent 做开发，所以导出要写成清楚的开发任务，而不是只写灵感。
- “开发前验证”表示先用低成本方式确认需求，不是 QA 测试，也不是代码测试。

一句话目标：

```text
把用户的项目想法拆成：可解决市场痛点的最小 MVP + 带成本和创新判断的拓展功能池 + 可直接交给 agent 的开发 brief。
```

## 当前主应用已实现能力

主应用在 `index.html`，已经具备：

- 用户空间：不同用户名拥有独立项目记录。
- 默认项目：线上衣橱、AI 旅行打包助手、AI 简历优化助手。
- 新建项目：输入项目点和真实场景，生成中心节点和第一层功能分支。
- MVP-first 结构：保存 `mvp / directions / decisions` 等字段。
- Fresh 主界面：顶部栏可折叠，方向卡展示难度/预计时间，右侧详情展示创新切口、开发前验证和 Agent 开发 Brief。
- 功能图浏览：点击节点进入当前节点视图，显示当前路径和下一层节点。
- AI 发散：配置 `DEEPSEEK_API_KEY` 后走 `/api/storm`，未配置时使用本地 fallback。
- 节点操作：编辑、手动加点子、删除节点/子树。
- 决策记录：加入备选库、以后再看。
- 导出：当前项目可复制/下载 agent-ready Markdown。
- 后端 API：会话、用户项目空间、AI 状态、版本检查。
- WebSocket：保留多人通道基础测试。
- CI：`.github/workflows/realtime-preview-ci.yml` 会在 PR 上跑 `npm ci` + `npm test`。

## 当前不足

主应用功能已经能跑，并已把 demo 的核心表达合入。但后续仍可继续优化：

- 画布节点布局仍可继续做更精细的防重叠和自动排版。
- 移动端顶部栏可再压缩，但当前已可用。
- AI 输出质量还可以通过更多真实项目样例继续调 prompt。
- `concept-fresh-demo.html` 是参考样板，后续不要把它当成独立产品线继续堆功能。

因此下一步建议围绕主应用继续打磨，而不是继续只改 demo。

## 下一步建议拆分

建议新开后续任务或 PR，继续在主应用上打磨：

1. 继续优化画布布局，减少节点重叠和跳动。
2. 提升移动端顶部栏和画布阅读效率。
3. 用更多真实项目样例调优 AI 输出，让功能建议更有创新性和实现判断。
4. 考虑把难度、时间、创新切口做成可编辑字段。
5. 保留现有后端、用户空间、持久化和测试，不要为了视觉再牺牲已有功能。

重要：`concept-fresh-demo.html` 目前仍是纯静态参考 demo，不接后端、不保存真实用户数据。正式体验请看 `index.html`。

## 验证证据

本地全量测试：

```bash
npm test
```

最近一次结果：

- HTML syntax：通过
- API：56 passed, 0 failed
- WebSocket：12 passed, 0 failed
- Frontend：181 passed, 0 failed

主应用浏览器验证：

- 桌面无横向溢出。
- 手机无横向溢出。
- 顶部栏 `收起顶部栏 / 展开顶部栏` 正常。
- 右侧详情包含 `交给 Agent 的开发 Brief`。
- 方向卡片包含难度和预计时间。
- 导出菜单正常打开。
- `projectMarkdown()` 内容包含：
  - `CanvasStorm Agent 开发 Brief`
  - `开发前验证`
  - `实现难度`
  - `预计时间`
  - `创新切口`
- console：0 errors, 0 warnings。

安全检查：

- `.env` 已在 `.gitignore`。
- 不要提交真实 API key。
- `index.html`、`tests/frontend-data.test.js`、`HANDOFF.md`、`concept-fresh-demo.html` 已扫描，没有真实 `sk-...` 或 GitHub token。

## 关键文件

- `index.html`：当前主前端，包含 UI、状态管理、功能图渲染、节点操作、导出逻辑。
- `concept-fresh-demo.html`：用户确认的下一版清爽方向 demo。
- `server/app.js`：Express 入口，挂载 API 和静态资源。
- `server/routes/storm.js`：AI 发散接口和状态接口。
- `server/routes/users.js`：用户项目空间 API。
- `server/storage.js`：本地 JSON 存储。
- `server/ws.js`：WebSocket 通道。
- `tests/frontend-data.test.js`：前端数据流和核心交互测试。
- `tests/api-backend.test.js`：后端 API 测试。
- `tests/ws.test.js`：WebSocket 测试。
- `tests/html-syntax.test.js`：HTML 内联脚本语法检查。
- `GOAL_MVP_FIRST_REFACTOR.md`：上一轮 MVP-first Goal 文档。
- `PR_PLAN.md`：上一轮 PR 拆分计划。
- `.xds/goals/canvasstorm-mvp-first-refactor.json`：上一轮 Goal 机器进度。

## 给下一位 Codex 的提醒

- 先运行 `${CODEX_HOME:-$HOME/.codex}/bin/xixi-dev-system profile sync`、`doctor`、`updates`。
- 不要直接合并 PR #5，除非用户明确说可以合并。
- 不要把 `concept-fresh-demo.html` 当成已经接入真实数据的正式产品。
- 下一轮应以“把 demo 的清晰产品结构迁入主应用”为目标。
- 改 UI 时必须继续跑 `npm test`，并用浏览器检查桌面和手机布局。
- 上传前必须检查密钥，尤其是用户曾经在聊天里贴过真实 API key。
