# Canvas Storm

## 仓库身份

| 项目 | 说明 |
|---|---|
| 类型 | 产品仓库：头脑风暴画布，目前仍在建设中。 |
| 协作关系 | 由 `xixi-dev-system` 接入和检查；质量结论供 `quality-hub` 展示。 |
| 平时需要打开吗 | 开发画布功能时打开；查看整体状态时只看 Quality Hub。 |
| 当前状态 | 使用中，但后端入口 `server/app.js` 尚未实现，质量报告会如实显示失败。 |
| 新电脑恢复 | `git clone` 后运行 `~/.codex/bin/xixi-dev-system doctor --project .`；当前静态页面可直接预览，后端完成后再运行 `npm install`。 |

## 当前范围

仓库现有 `index.html` 静态画布和后端建设任务。详细进度以 `CURRENT_STATUS.md` 与 `TASKS.md` 为准；`quality/data/latest.json` 保存最近一次真实检查结论。

不同产品保持独立视觉，本仓库不继承 Quality Hub 或其他项目的页面风格。
