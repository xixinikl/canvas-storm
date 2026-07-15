# CanvasStorm MVP-first 重构 Goal

更新时间：2026-07-15

## 唯一权威文档

本文件是 CanvasStorm 下一轮 MVP-first 重构的唯一权威入口。`PR_PLAN.md` 记录 PR 拆分细节；`.xds/goals/canvasstorm-mvp-first-refactor.json` 记录 xixi-dev-system 的机器可读进度。

进度百分比只从 xixi goal 的已验证任务数自动计算，不手写、不凭感觉估算。当前 8 个任务的实际刻度为 12%、25%、38%、50%、62%、75%、88%、100%。

## 当前事实

- 当前仓库：`https://github.com/xixinikl/canvas-storm.git`
- 当前分支：`cx/direction-workbench-ci`
- 当前基线提交：`209c972 feat: rebuild canvas storm workbench`
- 当前产品状态：登录、项目记录、AI/fallback 生成、画布节点、备选库、以后再看、导出和测试基础已存在。
- 当前未解决核心问题：产品模型仍混杂 MVP 判断、功能发散和节点树浏览；用户不容易理解下一步该做什么。
- 当前质量门禁：`npm test`
- 当前 CI 边界：GitHub Actions workflow 仍受 token `workflow` scope 限制，不能把 CI 上传状态写成已完成。

## 目标文本

将 CanvasStorm 重构为清晰的 MVP-first 功能发散工具：

1. 用户输入项目想法。
2. 系统先生成核心必做 MVP。
3. 系统给出功能发散方向。
4. 用户选择一个方向后，沿该方向生成下一层功能。
5. 用户可以补充当前层、进入下一层、加入灵感备选库或放到以后再看。

## 范围

- 建立可追踪 Goal、PR 规划和交接状态。
- 重构前端数据模型，让项目包含 MVP 主线、发散方向、方向节点和决策记录。
- 重写 AI/fallback 输出契约，支持 MVP-first 结构。
- 重构首屏和方向探索画布，确保中心想法清楚、节点不重叠、主操作唯一。
- 更新测试，覆盖创建项目、生成 MVP、选择方向、补充当前层、进入下一层、备选库持久化。
- 使用真实浏览器完成桌面和移动端主路径验收。

## 不包含

- 不做正式账号系统。
- 不做数据库迁移。
- 不做线上部署。
- 不做多人协作。
- 不做复杂拖拽编辑器。
- 不提交 `.env`、API key、运行时数据、截图输出目录。

## 阶段计划

| 任务 ID | PR 阶段 | 状态 | 完成后进度 | 验收标准 |
|---------|---------|------|------------|----------|
| PR0 | 状态和规划收口 | 已验证 | 12% | Goal 文档、PR 计划、交接状态和项目 adapter 可追踪，工作区可提交 |
| PR1 | 预览/分支卫生收口 | 已验证 | 25% | 现有预览 PR 状态明确，本地超前提交处理完毕 |
| PR2 | MVP-first 数据模型 | 已验证 | 38% | 新旧项目均可读取，新项目包含 MVP、directions、exploration nodes |
| PR3 | AI/fallback 输出契约 | 已验证 | 50% | AI 和本地降级都返回 MVP-first 结构，测试覆盖解析和容错 |
| PR4 | 首屏信息架构 | 已验证 | 62% | 首屏清楚展示 MVP 主线和方向选择，只有一个主动作 |
| PR5 | 方向画布与交互语义 | 已验证 | 75% | 选择方向、补充当前层、进入下一层三种行为稳定且不混淆 |
| PR6 | 持久化、导出和测试补强 | 已验证 | 88% | 用户项目保存/恢复、备选库和导出适配新结构，`npm test` 通过 |
| PR7 | 浏览器验收和合并准备 | 已验证 | 100% | 桌面/移动端主路径走通，PR 描述、测试证据、风险边界齐全 |

## 证据槽

每个任务完成时必须至少记录一种证据：

- `test`：例如 `npm test` 通过。
- `file`：例如某个设计/状态/交接文档更新。
- `screenshot`：例如桌面/移动端验收截图。
- `url`：例如 GitHub PR 地址。
- `command`：例如 `git status`、`xixi-dev-system doctor`、`goal show` 输出。

没有证据的任务不能标记为完成。

## 停止条件

- 出现未确认的破坏性数据迁移。
- AI 输出契约需要后端接口大改且会影响现有 API 消费方。
- 当前分支发现非本轮任务的大量用户改动，无法安全区分。
- `npm test` 失败且失败原因无法在本轮修复。
- GitHub 权限阻止 push/PR/CI 且没有可替代验收路径。

## 开 Goal Prompt

```text
按照 CanvasStorm MVP-first 重构 Goal 推进。每次只运行一个任务，任务完成必须通过 xixi-dev-system goal task verify 记录证据。汇报时带当前百分比、已验证任务数、当前 PR 阶段和下一步。
```

## 完成审计

完成审计结果：

- [x] xixi goal 进度为 100%。
- [x] 所有任务均有证据。
- [x] `npm test` 通过。
- [x] quality report 5/5 通过，且包含 `npm test`。
- [x] PR 描述包含 Summary、Current Status、Evidence、Verified PR Stages、Known Limits。
- [x] 未提交 `.env`、API key、`data/`、`output/`、`node_modules/`。
