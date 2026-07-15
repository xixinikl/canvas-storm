# CanvasStorm 交接文档

更新时间：2026-07-16 02:50（Asia/Shanghai）

## 当前结论

CanvasStorm 现在有两条线：

1. `index.html` 是当前主应用，已经完成 MVP-first 功能图重构，PR #5 正在等待用户最终验收。
2. `concept-fresh-demo.html` 是用户刚确认的新版视觉和产品表达 demo，用来指导下一轮把主应用界面改得更清晰、更清爽。

这次新增的 `concept-fresh-demo.html` 不要误当成正式主入口。它是“设计/产品方向样板”，作用是给下一位开发者或另一个电脑上的 Codex 看懂：下一版 CanvasStorm 应该怎么呈现 MVP、拓展功能、难度、时间、创新切口和可交给 agent 的开发 brief。

## 仓库与分支

- 仓库：`https://github.com/xixinikl/canvas-storm.git`
- 当前分支：`cx/direction-workbench-ci`
- 当前 PR：[#5 feat: CanvasStorm workbench baseline and MVP-first refactor plan](https://github.com/xixinikl/canvas-storm/pull/5)
- PR 目标分支：`main`
- PR 状态：Draft，保持给用户验收，不要未经确认直接合并。
- 最近远端提交：`f24cbdb fix: improve canvas readability and keep feedback`

另一个电脑继续工作：

```bash
git clone https://github.com/xixinikl/canvas-storm.git
cd canvas-storm
git checkout cx/direction-workbench-ci
cp .env.example .env
# 如需真实 AI，再编辑 .env 填 DEEPSEEK_API_KEY
npm install
npm start
```

主应用入口：

```text
http://127.0.0.1:3000/
```

新版方向 demo：

```text
http://127.0.0.1:3000/concept-fresh-demo.html
```

## 这次新增 demo 做了什么

文件：`concept-fresh-demo.html`

用户已确认“就这样”，因此这份 demo 代表下一步 UI/产品方向：

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
- 功能图浏览：点击节点进入当前节点视图，显示当前路径和下一层节点。
- AI 发散：配置 `DEEPSEEK_API_KEY` 后走 `/api/storm`，未配置时使用本地 fallback。
- 节点操作：编辑、手动加点子、删除节点/子树。
- 决策记录：加入备选库、以后再看。
- 导出：当前项目可复制/导出 Markdown。
- 后端 API：会话、用户项目空间、AI 状态、版本检查。
- WebSocket：保留多人通道基础测试。
- CI：`.github/workflows/realtime-preview-ci.yml` 会在 PR 上跑 `npm ci` + `npm test`。

## 当前不足

主应用功能已经能跑，但用户仍觉得：

- 画布观感不够好，容易晕。
- 层级和动作语义仍需要更直观。
- 节点布局仍可能显得拥挤。
- “加入备选库”等反馈可以更强。
- UI 应该继续向 `concept-fresh-demo.html` 的清爽方向靠拢。

因此下一步不要继续在旧视觉上小修太多，建议把 demo 的信息架构迁回主应用。

## 下一步建议拆分

建议新开后续任务或 PR，不要直接把 demo 粗暴替换主应用：

1. 把主应用顶部栏改为 demo 的清爽工具栏，并支持折叠。
2. 把主应用首屏改成“市场问题 / 最小 MVP / 拓展功能池”的清晰结构。
3. 给功能节点补充难度、预计时间、创新切口、开发前验证。
4. 改造导出 Markdown，让它输出 agent-ready brief。
5. 优化画布布局，减少节点重叠和跳动。
6. 保留现有后端、用户空间、持久化和测试，不要为了 UI demo 牺牲已有功能。

重要：`concept-fresh-demo.html` 目前是纯静态 demo，不接后端、不保存真实用户数据。迁入主应用时要接回现有 `users` API 和本地持久化逻辑。

## 验证证据

本地全量测试：

```bash
npm test
```

最近一次结果：

- HTML syntax：通过
- API：56 passed, 0 failed
- WebSocket：12 passed, 0 failed
- Frontend：170 passed, 0 failed

demo 浏览器验证：

- 桌面无横向溢出。
- 手机无横向溢出。
- 顶部栏 `收起顶部栏 / 展开顶部栏` 正常。
- 说明卡折叠正常。
- 点击拓展功能后右侧详情会更新。
- 导出菜单正常打开。
- `markdown()` 内容包含：
  - `CanvasStorm Agent 开发 Brief`
  - `开发前验证`
  - `实现难度`
  - `预计时间`
  - 当前选中功能名
- console：0 errors, 0 warnings。

安全检查：

- `.env` 已在 `.gitignore`。
- 不要提交真实 API key。
- `concept-fresh-demo.html` 已扫描，没有真实 `sk-...` 或 GitHub token。

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
