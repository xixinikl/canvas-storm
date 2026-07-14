# CanvasStorm 交接文档

更新时间：2026-07-15

## 当前定位

CanvasStorm 是一个“从项目想法出发的功能发散工具”。当前代码已经从早期的自由思维导图，迭代到“项目记录 + 功能图 + AI 发散 + 本地持久化 + 后端同步”的原型。

但最近一轮用户反馈明确指出：现在的产品模型仍然混杂了 MVP 判断、功能发散和树状分层浏览，容易让用户不知道“保留”“发散”“进入下一层”分别代表什么。

## 用户刚确认的产品方向

下一版建议不要继续小修当前交互，而是把产品模型改成四段：

1. 输入项目思路
2. 先生成“核心必做最小 MVP”
3. 再给出“功能发散方向”
4. 用户选择某个方向后，再沿该方向生成节点

推荐的核心规则：

- MVP 主线回答“这个项目最小能做什么”。
- 发散方向回答“还能从哪些功能角度扩展”。
- 点击方向后，只展示“当前方向 + 它的下一层节点”。
- 继续发散只补充当前节点下面这一层，不自动跳到子节点，也不重新洗牌版面。
- 点击某个子节点，才进入它自己的下一层。
- 保留/以后再看应随时可用，不应依赖进入下一层。

## 当前已实现能力

- 用户空间：不同用户名拥有独立项目记录。
- 默认项目：线上衣橱、AI 旅行打包助手、AI 简历优化助手。
- 新建项目：输入项目点和真实场景，生成中心节点和第一层功能分支。
- 功能图浏览：点击节点进入当前节点视图，显示当前路径和下一层节点。
- AI 发散：配置 `DEEPSEEK_API_KEY` 后走 `/api/storm`；未配置时使用本地 fallback 示例。
- 节点操作：编辑、手动加点子、删除节点/子树。
- 决策记录：加入备选库、以后再看。
- 导出：当前项目可复制/导出 Markdown。
- 后端 API：会话、用户项目空间、AI 状态、版本检查。
- WebSocket：保留多人通道基础测试。
- CI：本地 `npm test` 已覆盖；GitHub Actions workflow 因当前 token 缺少 `workflow` scope，暂未上传。

## 当前交互状态

当前 MVP-first Goal 已推进到 100%（PR0-PR7 已验证）。最近几次修改把方向画布语义、持久化、导出和最终验收收清楚了：

- 推荐只作为提示，不再由主按钮自动跳层。
- 点击画布节点才进入该节点。
- 生成/补充只作用于当前节点的下一层。
- 删除了重复的“继续发散”按钮，避免和“补充子功能”混淆。
- 方向区、画布节点和子功能列表显式标注“进入下一层”。
- 底部命令条和右侧主按钮统一使用“补充这一层”，表示只补当前同层。
- 手机第 4 步画布只预览当前方向和一个推荐子功能，其他子功能放在下方列表比较，避免固定命令条遮挡节点。
- AI 或用户生成的 MVP 主线会在后续保存/归一化时保留，不会被默认推荐重新覆盖。
- Markdown 导出包含“核心 MVP / 发散方向 / 灵感备选库 / 以后再看 / 功能图”。
- 后端用户项目 API 已测试 `mvp/directions/decisions` 保存和读取。
- 已合并 `origin/main` 并解决 `.xixi-dev-system.json`、`README.md` 冲突。
- quality workflow 已补齐 `npm ci` 和包含 `npm test` 的质量报告检查。
- 最终桌面/手机 Playwright 主路径通过，截图在 `output/playwright/pr7-final-*.png`。

当前剩余重点是用户主观验收和是否合并 PR #5。

## 建议下一步重构

优先让用户试用当前分支或 PR #5；不要在验收前继续叠新功能。

当前已经建立正式 Goal：

- 权威文档：`GOAL_MVP_FIRST_REFACTOR.md`
- PR 拆分：`PR_PLAN.md`
- 机器可读进度：`.xds/goals/canvasstorm-mvp-first-refactor.json`
- 协作要求：后续 Codex 任务应持续追踪完整 PR4-PR7，不要完成一个小 PR Goal 就结束总工作。

查看进度：

```bash
${CODEX_HOME:-$HOME/.codex}/bin/xixi-dev-system goal show --project . --goal canvasstorm-mvp-first-refactor
```

进度规则：共 8 个可验证 PR 阶段，实际刻度为 12%、25%、38%、50%、62%、75%、88%、100%。不要手写臆测百分比。

建议新界面结构：

```text
顶部：项目名称 / 当前路径 / 导出 / 新建

左侧或上方：最小 MVP 主线
- MVP 目标
- 必做功能 1
- 必做功能 2
- 必做功能 3

中间：发散方向区
- 降低输入成本
- 提升准确率
- 优惠提醒
- 历史价格
- 分享/导购

右侧：当前方向详情
- 为什么推荐
- 最小验证动作
- 加入备选 / 暂缓

画布主体：只展示当前方向和它的下一层节点
```

关键交互规则：

- 首次生成必须先产出 MVP 主线。
- “发散方向”是方向，不是立即要做的功能。
- “生成节点”必须明确作用域：只给当前方向/当前节点生成下一层。
- “补充这一层”只补同级，不进入下一层。
- “进入下一层”只由点击某个节点触发。

## 关键文件

- `index.html`：当前主前端，包含 UI、状态管理、功能图渲染、节点操作、导出逻辑。
- `server/app.js`：Express 入口，挂载 API 和静态资源。
- `server/routes/storm.js`：AI 发散接口和状态接口。
- `server/routes/users.js`：用户项目空间 API。
- `server/storage.js`：本地 JSON 存储。
- `server/ws.js`：WebSocket 通道。
- `tests/frontend-data.test.js`：前端数据流和核心交互测试。
- `tests/api-backend.test.js`：后端 API 测试。
- `tests/ws.test.js`：WebSocket 测试。
- `tests/html-syntax.test.js`：HTML 内联脚本语法检查。
- CI workflow：暂未提交。若需要 GitHub Actions，请用带 `workflow` scope 的 token 再添加 `.github/workflows/ci.yml`。

## 本地启动

```bash
cd /Users/miduoduo/Documents/思维风暴
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
npm install
npm start
# 打开 http://127.0.0.1:3000/
```

## 测试

```bash
npm test
```

当前最近一次全量测试结果：

- HTML syntax：通过
- API：52 passed
- WebSocket：12 passed
- Frontend：129 passed

## Git 状态

当前本地分支：

```text
cx/direction-workbench-ci
```

当前远端：

```text
origin -> https://github.com/xixinikl/canvas-storm.git
```

当前分支已推送到该远端。早先用户提到的 `2082743849-beep/canvas-storm.git` 后续解析为移动后的目标仓库。

## 密钥注意事项

- `.env` 已加入 `.gitignore`。
- 真实 API key 不应提交。
- 提交前已用关键片段搜索，真实 key 未出现在可提交文件中。

## 当前待办建议

1. 继续 PR5：重构方向画布和交互语义。
2. 按 `PR_PLAN.md` 推进下一轮产品重构。
3. 优先重构产品模型：
   - 先生成 MVP 主线。
   - 再生成发散方向。
   - 方向内按层级生成节点。
4. 修复当前画布节点重叠问题，或直接用新的层级布局替换现有自由坐标布局。
5. 将 UI 文案统一为：
   - MVP 主线
   - 发散方向
   - 当前节点
   - 下一层功能
   - 补充这一层
   - 进入下一层
