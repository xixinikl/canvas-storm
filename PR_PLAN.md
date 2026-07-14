# CanvasStorm 下一轮 PR 规划

更新时间：2026-07-12

## PR 基本信息

| 字段 | 内容 |
|------|------|
| 建议 PR 标题 | `refactor: rebuild MVP-first direction workflow` |
| 当前分支 | `cx/direction-workbench-ci` |
| 目标仓库 | `https://github.com/xixinikl/canvas-storm.git` |
| 当前提交基线 | `209c972 feat: rebuild canvas storm workbench` |
| PR 类型 | 产品模型重构 + 前端交互重构 + 测试补强 |
| 当前状态 | 未开始实现；已完成事实梳理和任务拆分 |
| 跟踪 PR | [#5 feat: CanvasStorm workbench baseline and MVP-first refactor plan](https://github.com/xixinikl/canvas-storm/pull/5)（Draft） |

Goal 入口：[`GOAL_MVP_FIRST_REFACTOR.md`](./GOAL_MVP_FIRST_REFACTOR.md)

百分比规则：本轮按 8 个可验证 PR 阶段计算，实际刻度为 12%、25%、38%、50%、62%、75%、88%、100%。百分比以 `xixi-dev-system goal show` 为准。

## 背景判断

当前版本已经具备登录、项目记录、AI/fallback 生成、画布节点、节点继续发散、加入备选库、以后再看、导出和测试基础。

但它还没有解决最核心的产品心智问题：用户输入一个项目想法后，系统应该先帮用户确认“最小可做 MVP”，再让用户选择“功能发散方向”。当前版本仍然容易把 MVP 判断、功能发散、节点树浏览混在一起，导致用户不知道“发散”“进入下一层”“补充这一层”分别在做什么。

因此下一轮 PR 不建议继续做零散 UI 修补，而是做一次产品模型重构。

## PR 完成标准

- 用户输入项目想法后，首页先生成并展示“核心必做 MVP”。
- 系统同时展示 3-5 个“功能发散方向”，方向不是立即要做的功能。
- 用户点击某个方向后，只进入该方向，不重排整个项目。
- 当前方向内可以生成下一层功能节点。
- “补充这一层”和“进入下一层”语义清楚且行为不同。
- 每个节点都可以加入灵感备选库或放到以后再看。
- 画布不出现中心想法看不清、子节点重叠、主操作互相抢焦点的问题。
- 前端测试覆盖 MVP-first 主流程、方向选择、补充同层、进入下一层和用户项目持久化。
- `npm test` 通过。

## 任务拆分与进度

| 编号 | 任务 | 状态 | 影响范围 | 验证方式 | 当前证据 |
|------|------|------|----------|----------|----------|
| T0 | PR 事实梳理与范围收敛 | 已完成 | 文档、Git 状态 | `git status`、`git log -1`、阅读 README/TASKS/CURRENT_STATUS/HANDOFF | 当前分支为 `cx/direction-workbench-ci`，基线提交为 `209c972`，远端为 `xixinikl/canvas-storm` |
| T1 | 定义 MVP-first 数据模型 | 未开始 | `index.html` 状态结构、用户项目 JSON、fallback 数据 | 新增/更新前端数据测试，验证旧项目可读、新项目有 MVP 与方向 | 待实现 |
| T2 | 重写 AI 输出契约 | 未开始 | `server/routes/storm.js`、前端 AI 调用解析、fallback 生成 | API 测试 + 前端测试，验证返回结构包含 `mvp`、`directions`、`children` | 待实现 |
| T3 | 重构首屏信息架构 | 未开始 | `index.html` UI/CSS | Playwright 桌面/移动截图验收，首屏可见 MVP 和方向选择 | 待实现 |
| T4 | 重构方向探索画布 | 未开始 | 画布渲染、节点布局、SVG 连线 | 前端测试 + 浏览器视觉验收，验证不重叠、不跳版、不隐藏中心想法 | 待实现 |
| T5 | 明确交互语义 | 未开始 | 节点点击、主按钮、命令条文案 | 测试“补充这一层只加同级”“点击子节点才进入下一层” | 待实现 |
| T6 | 保留灵感库与以后再看 | 未开始 | 决策状态、项目持久化、导出 | 前端测试，验证多个节点可连续加入备选库并持久化 | 待实现 |
| T7 | 历史项目兼容/迁移 | 未开始 | 用户项目读取、默认项目、localStorage 兜底 | 测试旧 node-only 项目可打开，新结构项目可保存 | 待实现 |
| T8 | 自动化测试补强 | 未开始 | `tests/frontend-data.test.js`、API/WS 受影响测试 | `npm test` | 待实现 |
| T9 | 真实浏览器验收 | 未开始 | 桌面和移动端主路径 | 启动本地服务，Playwright 验证登录、创建、选方向、生成、收藏 | 待实现 |
| T10 | PR 文档与交付说明 | 进行中 | `PR_PLAN.md`、`CURRENT_STATUS.md`、`HANDOFF.md` | 文档审计，确认没有过期远端/CI/密钥描述 | 本文件已创建 |

## 推荐实现顺序

1. 先做 T1 和 T2：把数据结构和 AI/fallback 输出契约统一，否则 UI 继续修也会乱。
2. 再做 T3 和 T4：用新的结构重画首屏和方向画布。
3. 接着做 T5 和 T6：把用户操作语义钉死，避免“发散”和“进入下一层”再次混淆。
4. 然后做 T7 和 T8：保证老项目能打开，测试能保护主流程。
5. 最后做 T9 和 T10：真实浏览器验收、整理 PR 描述和交接记录。

## 建议 PR 描述草稿

### Summary

- Rebuild CanvasStorm around an MVP-first workflow.
- Separate MVP trunk, exploration directions, and direction-level feature nodes.
- Clarify the difference between supplementing the current layer and entering the next layer.
- Add regression tests for the new project workflow and node decision flow.

### Why

The previous canvas prototype had working mechanics, but the product model mixed MVP selection, feature exploration, and tree navigation. Users could not reliably tell what the next action meant or why the canvas rearranged itself.

### Test Plan

- `npm test`
- Browser check: login -> create project -> view MVP -> choose direction -> generate child features -> add multiple ideas to the idea pool -> switch projects
- Browser check on mobile viewport for no overlap, no hidden primary action, and readable center idea

### Known Limits

- Production authentication is still out of scope.
- GitHub Actions workflow is not included until a token with `workflow` scope is available.
- This PR should not add deployment, collaboration, or paid account features.

## 风险与控制

| 风险 | 控制方式 |
|------|----------|
| 改动集中在单文件 `index.html`，容易牵连过多 | 先锁数据模型，再按主流程纵向切片实现 |
| 旧项目数据结构不兼容 | T7 单独做迁移/兼容测试 |
| AI 输出不稳定 | 保持 fallback 路径，并让前端容错解析 |
| UI 又变成信息过载 | 首屏只保留 MVP、方向和一个主动作，详情放到选择之后 |
| CI 无法上传 | 本轮以本地 `npm test` 作为质量门禁，CI 等 token 权限补齐后再加 |

## 本轮不做

- 不做正式账号系统。
- 不做数据库迁移。
- 不做线上部署。
- 不做多人协作。
- 不做复杂拖拽排版。
- 不把 API key 或 `.env` 提交到仓库。

## 当前证据记录

- `git status --short --branch`：当前分支为 `cx/direction-workbench-ci...origin/cx/direction-workbench-ci`，开始规划前工作区干净。
- `git log -1 --oneline`：当前基线为 `209c972 feat: rebuild canvas storm workbench`。
- `git remote -v`：远端为 `https://github.com/xixinikl/canvas-storm.git`。
- 已阅读 `README.md`、`TASKS.md`、`CURRENT_STATUS.md`、`HANDOFF.md`、`package.json`。
- `.gitignore` 已忽略 `.env`、`data/`、`output/`、`node_modules/`。
