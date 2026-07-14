# CanvasStorm — 当前状态

| 字段 | 内容 |
|------|------|
| 当前分支 | cx/direction-workbench-ci |
| 当前主流程 | 本地登录 + 用户项目空间 + 图形化功能发散 |
| 进行中 | PR6：持久化、导出和测试补强已验证 |
| 下一步 | 从 PR7“浏览器验收和合并准备”继续 |
| 质量门禁 | `npm test` 已通过；GitHub Actions 因 token 缺少 `workflow` scope 暂未上传 |

下一轮 PR 规划入口：[`PR_PLAN.md`](./PR_PLAN.md)
当前 Goal 入口：[`GOAL_MVP_FIRST_REFACTOR.md`](./GOAL_MVP_FIRST_REFACTOR.md)
机器可读进度：`.xds/goals/canvasstorm-mvp-first-refactor.json`
当前进度：88%（7/8，PR0-PR6 已验证）
跟踪 PR：[#5 feat: CanvasStorm workbench baseline and MVP-first refactor plan](https://github.com/xixinikl/canvas-storm/pull/5)（Draft）

协作约定：后续 Codex 任务必须持续挂在完整 MVP-first 重构 Goal 上，不再用单个 PR 的短 Goal 代替总目标；每个 PR 完成时同步更新 xixi Goal 百分比。

查看当前进度：

```bash
${CODEX_HOME:-$HOME/.codex}/bin/xixi-dev-system goal show --project . --goal canvasstorm-mvp-first-refactor
```

---

## 进度日志

- [x] 任务 1-9：项目骨架、会话 API、WebSocket 通道完成
- [x] 2026-07-14：接入 xixi-dev-system adapter，并建立 MVP-first 重构 Goal；PR 阶段进度按 8 个可验证任务自动计算百分比
- [x] 2026-07-14：PR1 预览和分支卫生收口 — 推送 `cx/realtime-preview-v1` 本地超前提交，修复 PR #4 adapter 冲突，Realtime preview CI 通过并合并 PR #4
- [x] 2026-07-14：PR2 MVP-first 数据模型 — 项目自动补齐 `schemaVersion: 2`、`mvp`、`directions`、`decisions` 和节点角色；旧 node-only 项目登录后自动迁移；`npm test` 通过
- [x] 2026-07-14：PR3 AI 和 fallback 输出契约 — 根节点生成契约改为 `mvp + directions`，方向/功能节点生成契约改为 `children`，旧数组格式保持兼容；`npm test` 通过
- [x] 2026-07-14：PR4 首屏信息架构 — 工作台首屏新增核心 MVP 和发散方向区，方向入口可直接进入对应方向；桌面/手机 Playwright 验证无横向溢出；`npm test` 通过
- [x] 2026-07-15：PR5 方向画布和交互语义 — 统一“补充这一层 / 进入下一层 / 生成子功能”的文案和行为；手机画布第 4 步只预览推荐子功能，避免命令条遮挡；`npm test` 通过，Playwright 桌面/手机截图验证通过
- [x] 2026-07-15：PR6 持久化、导出和测试补强 — 保留 AI/用户生成的 MVP 主线，Markdown 导出新增核心 MVP 和发散方向；API 覆盖 `mvp/directions/decisions` 保存读取；`npm test` 通过，Playwright 验证刷新后 MVP、方向和备选库保留
- [x] 2026-07-04：补充 AI 状态体验 — `/api/storm/status` 只返回配置状态和模型名
- [x] 2026-07-05：验证真实 DeepSeek 技术链路 — 本地 `.env` 配置真实 Key 后可返回真实 AI 候选
- [x] 2026-07-05：安装设计和验证相关 skill — `figma-generate-design`、`figma-create-design-system-rules`、`screenshot`、`playwright`
- [x] 2026-07-05：重构为图形化功能发散工具 — 登录后进入用户项目空间，默认展示“线上衣橱”功能图
- [x] 2026-07-05：实现节点继续发散 — 点击任意功能点可从该点生成下一层子功能
- [x] 2026-07-05：实现本地用户隔离 — 不同用户名拥有不同项目记录
- [x] 2026-07-05：更新前端测试 — 覆盖登录、用户隔离、功能图、节点发散、保留/不做、持久化
- [x] 2026-07-05：增强功能图视觉稳定性 — 节点改为非嵌套按钮结构，SVG 连线改用 viewBox 数值坐标，画布增加状态条和节点类型色彩
- [x] 2026-07-05：工作台清晰度打磨 — 左侧新建项目折叠、顶部 3 步流程、右侧当前功能决策面板、节点固定高度和布局 v4 迁移
- [x] 2026-07-05：真实浏览器验收 — Playwright 验证登录、默认“线上衣橱”工作台、继续发散后新增 2 个节点且不再遮挡中心节点
- [x] 2026-07-05：功能图进一步降噪 — 画布节点改为紧凑功能点，详情集中到右侧，并加入推荐动作帮助用户做取舍
- [x] 2026-07-05：登录记录体验补强 — 登录页增加最近项目空间，可从本地用户记录继续进入上次项目
- [x] 2026-07-05：新建项目主路径补强 — 顶部和侧栏新增“新建功能图”，弹窗引导输入项目点和真实场景，并已用 Playwright 验证自定义项目发散
- [x] 2026-07-05：右侧决策区收敛 — 将已保留/不做/下一步标签页改为常驻决策清单，减少用户来回切换和选择负担
- [x] 2026-07-05：画布路径理解增强 — 选中节点后高亮当前功能路径并弱化无关分支，强化“基于某个点继续发散”的心智
- [x] 2026-07-05：后端用户项目空间 — 新增 `/api/users/:user/projects`，前端登录读取后端项目并在变化后同步保存，同时保留 localStorage 兜底
- [x] 2026-07-05：工作台清晰度收敛 — 主操作改为“生成下一层功能”，右侧“决策清单”收敛为“结果摘要”，二级分支改为沿所选方向向外展开，并用 Playwright 验证干净用户生成链路
- [x] 2026-07-05：工作台视觉与实用性二次收敛 — 放大主画布、压缩顶部流程为轻量路径、根节点默认推荐聚焦一个 MVP 候选，右侧摘要只突出一个“建议先做”功能；靠边二级分支改成竖向错位布局，并用 Playwright 完整验证“登录 → 聚焦一键穿搭 → 生成下一层功能 → 后端保存”
- [x] 2026-07-05：聚焦式图布局 — 渲染层根据当前路径重新安排根节点、当前方向、同级方向和下一层功能，增加轻量碰撞避让；前端测试改为覆盖真实主路径“推荐聚焦 → 从该功能生成下一层”
- [x] 2026-07-05：侧栏收敛 — 登录后侧栏只保留项目列表和新建入口，示例统一放入新建弹窗，减少工作台第一屏干扰
- [x] 2026-07-05：登录页产品心智增强 — 将文字预览卡改为“线上衣橱 → 一键穿搭 / 拍照入库 / 一键发穿搭”的小型功能图，并补充前端测试覆盖
- [x] 2026-07-05：四步收敛工作台 — 默认新增“AI 旅行打包助手”真实项目示例，工作台顶部改为“项目点 → 功能方向 → 下一层 → MVP 取舍”，右侧主按钮随阶段变化；Playwright 验证登录、聚焦方向、真实 AI 生成和生成后布局，修复父子节点重叠问题
- [x] 2026-07-05：宽画布工作台 — 将项目记录从左侧栏改成横向项目条，主画布改为全宽工作区并为根节点视图提供放射布局；压缩流程条避免标题截断，用 Playwright 验证“登录 → 聚焦方向 → 生成下一层”截图
- [x] 2026-07-05：唯一推荐焦点 — 选方向阶段只在画布上标出一个“建议先做”节点，聚焦后自动收起推荐标记；右侧摘要压缩为轻量收敛信息，减少用户同时面对多个选择的压力
- [x] 2026-07-05：默认示例回归线上衣橱 — 新用户默认进入“线上衣橱”，推荐先聚焦“一键穿搭”，并验证可从该节点继续生成下一层功能，贴近用户原始需求心智
- [x] 2026-07-05：右侧决策面板美化 — 将“结果摘要”改为“本轮收敛”，优化右侧背景、推荐动作卡和收敛摘要布局，降低表单感；Playwright 验证默认态和生成态
- [x] 2026-07-05：生成态步骤性增强 — 画布顶部改为“现在只做”的阶段引导条；生成下一层后停留在父功能，右侧直接列出子功能选择，并只在当前这一层标记“建议保留”；Playwright 验证默认态、生成态和子功能详情态
- [x] 2026-07-05：配色与质感升级 — 工作台顶部改为深色品牌栏，项目激活态、画布网格、节点类型色和右侧决策卡统一调整；保留 MVP 动作改为绿色主按钮，并用 Playwright 验证默认态、生成态、取舍详情态
- [x] 2026-07-05：登录入口质感升级 — 登录页右侧改为项目空间卡片，补充“按项目保存 / 从节点发散”两条轻量说明；Playwright 验证登录页、新建弹窗和工作台视觉一致性
- [x] 2026-07-05：移动端入口压缩 — 手机登录页隐藏大型预览图，保证首屏能看到项目空间卡、用户名输入和进入按钮；Playwright 验证 390px 宽登录页与工作台
- [x] 2026-07-05：设计 skill 与主流产品参考重做交互焦点 — 使用 `frontend-design`、`web-design-guidelines` 和 Playwright，参考 Raycast / Vercel / Framer 一类产品的克制层级与动效原则；画布新增底部命令条，节点只负责选择，下一步统一由命令条驱动
- [x] 2026-07-05：功能图可读性降噪 — 进入项目默认回到中心节点；第一层只显示中心和一级方向，深入后只显示“中心 → 当前方向 → 当前子功能”，避免历史深层节点挤满首页
- [x] 2026-07-05：动效与可访问性补强 — 增加节点错峰进入、路径高亮、命令条专用入场动画、按钮 hover/focus、reduced-motion 兼容；表单补充 `name` / `autocomplete`，移动端命令条固定在底部
- [x] 2026-07-05：生成质量约束 — 调整 AI prompt 和推荐排序，避免“评分/反馈/优化分析”默认压过直观功能入口，优先生成搭配、发布、整理、清单、场景适配等用户能直接理解的功能点
- [x] 2026-07-05：结构级 UI 重排 — 按 `frontend-design` 重新收敛为“三栏工作台”：左侧项目空间、中间深色功能地图、右侧当前决策面板；删除横向项目条造成的多层堆叠感
- [x] 2026-07-05：功能地图视觉升级 — 主画布从浅色白板改成深色“功能地图 / 决策雷达”，增强图形化感；重新调整桌面与移动端节点布局，避免子功能互相遮挡或被命令条压住
- [x] 2026-07-05：主观验收截图 — Playwright 验证 `three-panel-map-v1.png`、`three-panel-focused-v2.png`、`three-panel-mobile-v1.png`，桌面与移动端均能看到推荐节点和下一步动作
- [x] 2026-07-05：MiMo 参考下的 art direction 重调 — 去掉高饱和 SaaS 蓝/绿/红，统一为暖纸白、墨黑、鼠尾草绿和雾蓝低饱和色彩系统；Playwright 截图验证 `art-palette-desktop-v1.png`、`art-palette-selected-v1.png`、`art-palette-mobile-v1.png`
- [x] 2026-07-05：舞台式第一屏降噪 — 桌面端隐藏常驻右侧详情栏，第一屏只保留项目标题、功能图舞台、当前动作命令条和底部项目卡；聚焦态节点上移，为命令条留出安全区；Playwright 验证 `stage-only-desktop-v1.png`、`stage-only-selected-v2.png`、`stage-only-mobile-v1.png`
- [x] 2026-07-05：像素级对齐与操作性整理 — 统一 16/24px 外框与面板内距、44px 以上主按钮、48px 流程块、放大节点点击区域；移动端命令条后续升级为固定底部，保证下一步动作始终可见；Playwright 验证 `pixel-align-desktop-v1.png`、`pixel-align-selected-v1.png`、`pixel-align-mobile-v2.png`
- [x] 2026-07-05：入口与命令条统一体验 — 登录页改为同一套暖纸白/黑线舞台风；桌面命令条补充“痛点 / 验证”两条最小依据，让用户不依赖右侧详情栏也能理解为什么要点下一步；Playwright 验证 `unified-login-v1.png`、`action-proof-desktop-v1.png`、`action-proof-selected-v1.png`、`action-proof-mobile-v1.png`
- [x] 2026-07-05：新建功能图弹窗统一 — 创建入口改为黑线框工具面板，左侧填写项目点和真实场景，右侧说明“中心节点 / 具体分支 / 先做一个”的产出路径；移动端改为纵向可操作布局；Playwright 验证 `create-modal-desktop-v1.png`、`create-modal-mobile-v1.png`
- [x] 2026-07-05：自定义项目创建即有分支 — 新建非模板项目时立即基于项目点和真实场景生成第一层候选功能，避免创建后只看到空中心节点；前端测试新增断言，新项目创建后节点数大于 1；Playwright 验证 `create-auto-branches-desktop-v1.png`
- [x] 2026-07-05：首屏方向选择降噪 — 默认只展示中心节点 + 3 个一级方向，排序压低延展/暂缓方向，保留“线上衣橱”的“一键穿搭 / 拍照入库 / 一键发穿搭”主线；移动端只展示 2 个方向，避免第一屏选择过载；Playwright 验证 `desktop-three-directions-sorted-v1.png`、`mobile-three-directions-sorted-v1.png`
- [x] 2026-07-05：场景化本地发散质量 — 本地 fallback 补强菜谱/食材、知识库/笔记、宠物健康、学习计划等真实场景，避免自定义项目在 AI 降级时生成“最小录入流程”这类泛化功能；前端测试新增知识库场景断言；Playwright 验证 `recipe-specific-branches-v1.png`
- [x] 2026-07-05：像素级收口与操作反馈 — 去掉工作台黑色圆形转场遮挡，压淡画布装饰；移动端顶栏、流程条、项目栏改为稳定网格布局并修复登录后滚动位置；命令条生成按钮增加“生成中...”禁用状态，前端测试新增慢 AI 响应断言；Playwright 验证 `pixel-refined-desktop.png`、`pixel-refined-mobile-v2.png`、`loading-state-mobile-v2.png`
- [x] 2026-07-05：推荐路线主视觉 — 选方向和选子功能阶段都把唯一推荐项升级为黑色主节点，其他候选降为备选，连线加粗突出“从想法到建议功能”的路线；移动端命令条改为固定底部，首屏即可看到下一步按钮；Playwright 验证 `route-focus-desktop-v1.png`、`route-focus-selected-desktop-v2.png`、`mobile-fixed-dock-default-v1.png`、`mobile-fixed-dock-selected-v1.png`
- [x] 2026-07-05：移动端登录入口压缩 — 手机登录页隐藏次要说明卡，压缩标题和说明文案，让用户名输入框与“进入工作台”主按钮进入首屏；Playwright 验证 `login-mobile-compressed-v1.png`，按钮底部位于 548px 且无横向溢出
- [x] 2026-07-05：桌面项目切换架轻量化 — 将底部项目栏从 132px 压缩为 104px 轨道，项目卡从 240px 改为 216px，降低表格感并给功能图舞台更多空间；Playwright 验证 `project-shelf-desktop-v1.png`，桌面/移动均无横向溢出
- [x] 2026-07-05：工作台留白再整理 — 隐藏画布右上角统计徽标，减少与推荐路线竞争的信息，让第一屏只保留项目、流程、功能图和下一步动作；Playwright 验证 `less-clutter-desktop-v1.png`、`less-clutter-mobile-v1.png`
- [x] 2026-07-05：命令条降噪 — 首屏命令条隐藏“痛点 / 验证”细节，只保留阶段、主建议、短说明和唯一主按钮，让用户第一眼更容易操作；Playwright 验证 `focused-command-desktop-v1.png`、`focused-command-mobile-v1.png`
- [x] 2026-07-05：流程轨轻量化 — 将顶部四步流程从重边框卡片改为细进度轨，只用黑底突出当前步骤，降低和推荐路线的视觉竞争；Playwright 验证 `light-flow-desktop-v1.png`、`light-flow-mobile-v1.png`
- [x] 2026-07-05：取舍完成态补强 — 保留 / 暂缓后顶部标题和命令条直接进入“已完成”状态，唯一主动作改为“回到上一层”，避免用户保留后仍停在同一个选择里；Playwright 验证 `decision-complete-v1.png`、`decision-complete-mobile-v2.png`
- [x] 2026-07-05：移动端顶栏压缩 — 小屏隐藏 CanvasStorm 长品牌字，只保留 CS 标记，让用户名、退出和新建入口不再挤压或截断；移动端验证无横向溢出
- [x] 2026-07-05：移动端功能图减负 — 手机画布只展示当前路线和推荐节点，不再把整层备选全部塞进首屏；Playwright 验证默认、聚焦、生成、查看建议、完成 5 个状态均无节点重叠、无命令条遮挡、无横向溢出，截图 `mobile-map-default-v3.png`、`mobile-map-children-v3.png`、`mobile-map-complete-v5.png`
- [x] 2026-07-05：登录入口去工程化 — 将“本地演示登录”改为“输入名字，继续你的功能图”，隐藏次要说明块，手机首屏主按钮从 548px 提前到 509px；Playwright 验证 `login-desktop-entry-v2.png`、`login-mobile-entry-v2.png`，前端测试新增入口文案防回退断言
- [x] 2026-07-05：新建弹窗再收敛 — 将两栏说明弹窗改为紧凑创建面板，标题压缩为“新建功能图”，右侧三段说明改成底部结果预告；手机创建按钮从 834px 提前到 621px，Playwright 验证 `create-modal-desktop-compact-v3.png`、`create-modal-mobile-compact-v3.png`
- [x] 2026-07-05：路线舞台视觉重做 — 功能图画布从浅色白板改成深色路线舞台，推荐路径使用暖绿色连线和浅色主节点；登录页示例图、底部项目轨道同步统一视觉语言，聚焦方向后当前节点保持主视觉，避免用户选中后迷路；Playwright 验证 `desktop-login-v3.png`、`desktop-route-stage-v2.png`、`route-stage-focused-v3.png`、`route-stage-generated-v2.png`、`mobile-route-stage-v2.png`
- [x] 2026-07-05：聚焦后单一路线 — 用户聚焦某个一级方向后，画布只保留“中心节点 → 当前方向”，隐藏同级备选，直到生成下一层才展示子功能候选；修正“右侧”类失配文案，确保每一步只指向当前真实可见的命令条和节点；Playwright 验证 `desktop-focus-only-route-v2.png`、`mobile-focus-only-route-v2.png`
- [x] 2026-07-05：手机入口图形化补强 — 移动端登录页恢复轻量路线预览，但只展示“线上衣橱 → 一键穿搭”两点路线，避免小屏节点重叠；新建弹窗的结果预告压缩成一行，创建按钮提前到首屏可见区域；Playwright 验证 `mobile-login-route-preview-v2.png`、`mobile-create-modal-compact-v4.png`
- [x] 2026-07-05：移动端详情按阶段出现 — 手机工作台第 2/3 步隐藏详情和取舍面板，只保留功能图与底部命令条；生成下一层进入第 4 步后再显示推荐动作、子功能选择和本轮收敛，避免早期重复按钮让用户纠结；Playwright 验证 `mobile-stage2-no-inspector-v1.png`、`mobile-stage3-no-inspector-v1.png`、`mobile-stage4-inspector-v1.png`
- [x] 2026-07-05：移动端第 4 步单一操作区 — 第 4 步顶部看图时隐藏详情区主按钮，只保留底部命令条；用户滑到详情区且命令条自动隐藏后，再显示详情区按钮，避免“查看建议 / 保留”在手机上重复出现；Playwright 验证 `mobile-stage4-top-single-action-v1.png`、`mobile-stage4-detail-single-action-v1.png`
- [x] 2026-07-05：排班类真实场景降级输出 — 本地 fallback 新增排班/门店/员工/咖啡店场景，生成“一键生成周班表 / 换班冲突提醒 / 高峰人手预估”等真实功能方向，避免自定义项目落回“最小录入流程”这类泛化功能；Playwright 验证 `scheduling-specific-branches-v1.png`
- [x] 2026-07-05：手机项目记录轨道 — 移动端项目区从两列小表格改为横向项目轨，高度从 132px 降到 104px，项目卡保留完整 title / aria-label；滚到项目和详情区后固定命令条自动隐藏，避免遮挡内容；Playwright 验证 `project-shelf-mobile-track-focus-v3.png`
- [x] 2026-07-05：完整主路径自检 — Playwright 走通桌面 / 手机“登录 → 默认项目 → 聚焦方向 → 生成子功能 → 新建学习计划项目 → 自动切换新项目”，未发现横向溢出、弹窗异常或命令条遮挡；证据截图 `audit2-desktop-created-v1.png`、`audit2-mobile-created-v1.png`、`audit2-mobile-modal-v1.png`
- [x] 2026-07-05：创建项目反馈修正 — 新建项目后 toast 改为“已创建某某功能图”，避免残留上一轮“已围绕某节点继续发散”的提示；Playwright 验证 `toast-create-project-v1.png`，前端测试新增当前项目反馈断言
- [x] 2026-07-05：键盘操作路径补强 — 用户名输入框支持 Enter 进入项目空间；新建弹窗里项目点按 Enter 跳到真实场景，真实场景 Cmd/Ctrl+Enter 创建功能图；Playwright 验证 `keyboard-create-project-v1.png`，前端测试新增键盘路径断言
- [x] 2026-07-05：移动端首屏再减负 — 手机顶部栏合成一行并隐藏 AI 状态，标题改为“项目：选一个方向”短句，推荐节点提前进入视野且命令条不再压住项目栏；Playwright 验证 `mobile-canvas-balance-v1.png`、`desktop-title-guard-v1.png`
- [x] 2026-07-05：手机流程轨降噪 — 移动端四步流程只展示当前步骤文字，其余步骤收为状态点，避免“项目 / 方向 / 拆解 / 取舍”四段小字同时抢注意力；Playwright 验证 `mobile-flow-track-default-v1.png`、`mobile-flow-track-focused-v1.png`、`mobile-flow-track-generated-v1.png`、`desktop-flow-guard-v1.png`
- [x] 2026-07-05：新建弹窗主动作隔离 — 打开“新建功能图”时进入 `modal-open` 状态，隐藏背景命令条并锁定背景滚动，避免“创建功能图”和“聚焦方向”两个主按钮同时抢注意力；Playwright 验证 `create-desktop-modal-open-v1.png`、`create-mobile-modal-open-v1.png`，前端测试新增弹窗背景状态断言
- [x] 2026-07-05：登录入口产品化文案 — 将“本地项目空间 / 无需密码 / 演示”类工程说明改为“项目记录 / 功能图空间”用户语言，主按钮统一为“进入功能图空间”；Playwright 验证 `login-entry-product-copy-desktop-v1.png`、`login-entry-product-copy-mobile-v1.png`，前端测试新增入口文案防回退断言
- [x] 2026-07-05：入口演示残留清理 — 登录快捷入口从“演示用户”改为“独立开发者”，空用户名默认进入“我的空间”，空记录提示统一为“功能图空间”；Playwright 验证 `login-entry-no-demo-desktop-v1.png`、`login-entry-no-demo-mobile-v1.png`，前端测试新增无演示芯片和空用户名断言
- [x] 2026-07-05：桌面 AI 状态去工程化 — 顶部状态从“AI 已连接 · deepseek-chat / AI 未配置”改为“AI 可用 / 本地示例”，保留状态能力但不在主界面暴露模型名；Playwright 验证 `desktop-ai-copy-v1.png`，前端测试同步断言
- [x] 2026-07-05：桌面取舍依据补强 — 第 4 步命令条才展开“痛点 / 验证”两条依据，第 2/3 步继续保持轻量，移动端仍隐藏顶部依据并把详情放到下方；Playwright 验证 `desktop-stage4-proof-dock-local-v3.png`、`desktop-stage4-child-proof-local-v3.png`、`mobile-stage4-proof-guard-local-v3.png`
- [x] 2026-07-05：CanvasStorm 清晰可用 v1 收口 — 按“打开就会用”的 v1 目标重新审计登录页、默认功能图、聚焦方向、生成下一层和新建项目；桌面第 4 步子功能候选下移成独立层级，避免压住父方向；Playwright 验证 `audit-desktop-v1-login.png`、`audit-desktop-v1-default.png`、`audit-mobile-v1-login.png`、`audit-mobile-v1-default.png`、`desktop-stage4-separated-v1.png`
- [x] 2026-07-05：核心功能心智修正 — 从“只保留一个 MVP”改成“找思路 + 收藏多个灵感备选”；第 4 步可连续收藏多个子功能，也可把暂时没感觉的点放到以后再看；项目卡和结果摘要显示备选数量与名称，Playwright 验证 `idea-pool-stage4-v2.png`、`idea-pool-two-saved-v2.png`

## 已知债务

- 当前 8 个节点规模下主路径已清楚；如果用户连续扩展到十几个以上节点，仍需要更完整的折叠、缩放或局部导航。
- 当前视觉已从后台感转向极简展陈式工作台，主路径从“选方向 → 生成下一层 → 只保留一个 → 回到上一层”已经闭环；后续仍可继续细化登录页、微动效和大规模功能树导航。
- 最新产品判断：下一轮不应继续只修 UI，而应重构为“先生成核心必做 MVP → 再选发散方向 → 沿方向生成节点”的清晰模型，避免 MVP 判断、功能发散和树状浏览继续混在一起。
