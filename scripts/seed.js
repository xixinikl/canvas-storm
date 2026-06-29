// CanvasStorm — 演示数据 seed 脚本
const storage = require('../server/storage');

const demoSessions = [
  {
    id: 'seed_demo_product',
    name: '新产品头脑风暴',
    nodes: [
      { id: 1, name: 'AI 智能笔记本', desc: '带 AI 辅助的手写笔记硬件，自动整理与摘要', x: 0, y: 0, difficulty: 6, innovation: 8.5, practicality: 9, category: '核心概念', parentId: null, children: [2, 3, 4, 5] },
      { id: 2, name: '手写识别 + OCR', desc: '毫秒级识别中英文手写，支持公式', x: -420, y: -220, difficulty: 7, innovation: 7, practicality: 8, category: 'AI/ML', parentId: 1, children: [] },
      { id: 3, name: '语音转文字实时同步', desc: '会议录音自动转写并与手写笔记对齐', x: -140, y: -280, difficulty: 6, innovation: 8, practicality: 9, category: 'AI/ML', parentId: 1, children: [6] },
      { id: 4, name: '跨设备云端同步', desc: '手机/平板/电脑实时同步，离线可用', x: 140, y: -280, difficulty: 5, innovation: 6, practicality: 8, category: '效率工具', parentId: 1, children: [] },
      { id: 5, name: 'AI 自动生成摘要', desc: '大模型读笔记后生成结构化摘要', x: 420, y: -220, difficulty: 5, innovation: 7.5, practicality: 8, category: 'AI/ML', parentId: 1, children: [] },
      { id: 6, name: '支持 12 种方言', desc: '语音识别覆盖粤语/四川话等主流方言', x: -280, y: -440, difficulty: 8, innovation: 7, practicality: 7, category: 'AI/ML', parentId: 3, children: [] },
      { id: 7, name: '学生/白领双版本', desc: '针对不同场景定制功能和定价', x: 0, y: -160, difficulty: 4, innovation: 5, practicality: 8, category: '市场策略', parentId: 1, children: [] },
      { id: 8, name: '硬件成本 < ¥300', desc: '物料成本控制在 300 元以内', x: -560, y: 0, difficulty: 7, innovation: 5, practicality: 9, category: '约束条件', parentId: 1, children: [] },
      { id: 9, name: 'Q3 发布众筹', desc: '第三季度在 Kickstarter 启动众筹', x: 560, y: 0, difficulty: 3, innovation: 4, practicality: 7, category: '时间线', parentId: 1, children: [] },
    ],
    edges: [
      { id: 101, from: 1, to: 2 }, { id: 102, from: 1, to: 3 },
      { id: 103, from: 1, to: 4 }, { id: 104, from: 1, to: 5 },
      { id: 105, from: 3, to: 6 }, { id: 106, from: 1, to: 7 },
      { id: 107, from: 1, to: 8 }, { id: 108, from: 1, to: 9 },
    ],
    nextId: 10,
    createdAt: '2026-06-15T09:30:00.000Z',
  },
  {
    id: 'seed_demo_website',
    name: '公司官网重设计划',
    nodes: [
      { id: 1, name: '官网重设计划 v2', desc: '全面提升品牌形象与转化率', x: 0, y: 0, difficulty: 6, innovation: 7, practicality: 8, category: '项目', parentId: null, children: [2, 3, 4] },
      { id: 2, name: '首页全屏视频背景', desc: '品牌宣传视频作为首屏背景，提升冲击力', x: -420, y: -200, difficulty: 4, innovation: 6, practicality: 7, category: '设计', parentId: 1, children: [5, 6] },
      { id: 3, name: '产品页 3D 展示', desc: 'Three.js 实现产品 360 度实时渲染', x: 0, y: -280, difficulty: 7, innovation: 8, practicality: 6, category: '交互体验', parentId: 1, children: [] },
      { id: 4, name: '博客迁移到 MDX', desc: '用 MDX 代替传统 CMS，支持组件嵌入文章', x: 420, y: -200, difficulty: 5, innovation: 6, practicality: 7, category: '技术', parentId: 1, children: [7] },
      { id: 5, name: '视频团队外包', desc: '找专业团队拍摄，预算 2 万', x: -560, y: -380, difficulty: 2, innovation: 3, practicality: 7, category: '执行', parentId: 2, children: [] },
      { id: 6, name: '移动端适配优先', desc: '先做移动端完美适配，再适配桌面', x: -280, y: -380, difficulty: 4, innovation: 5, practicality: 9, category: '设计', parentId: 2, children: [] },
      { id: 7, name: 'Next.js SSG', desc: '静态生成 + 增量渲染，首屏 < 1s', x: 560, y: -380, difficulty: 5, innovation: 5, practicality: 7, category: '技术', parentId: 4, children: [] },
      { id: 8, name: '6 月底上线', desc: '6 月 30 日前完成上线和回归测试', x: 0, y: 220, difficulty: 3, innovation: 2, practicality: 8, category: '时间', parentId: 1, children: [] },
    ],
    edges: [
      { id: 201, from: 1, to: 2 }, { id: 202, from: 1, to: 3 },
      { id: 203, from: 1, to: 4 }, { id: 204, from: 2, to: 5 },
      { id: 205, from: 2, to: 6 }, { id: 206, from: 4, to: 7 },
      { id: 207, from: 1, to: 8 },
    ],
    nextId: 9,
    createdAt: '2026-06-20T14:00:00.000Z',
  },
  {
    id: 'seed_demo_marketing',
    name: '618 营销方案',
    nodes: [
      { id: 1, name: '618 大促方案', desc: '年中促销活动的完整策划与执行', x: 0, y: 0, difficulty: 5, innovation: 6, practicality: 9, category: '主题', parentId: null, children: [2, 3, 4, 5] },
      { id: 2, name: '满 300 减 50', desc: '阶梯满减，300-50 / 600-120 / 1000-260', x: -420, y: -180, difficulty: 2, innovation: 3, practicality: 9, category: '优惠', parentId: 1, children: [] },
      { id: 3, name: '会员双倍积分', desc: '618 当天会员消费享双倍积分', x: -140, y: -260, difficulty: 2, innovation: 4, practicality: 7, category: '权益', parentId: 1, children: [] },
      { id: 4, name: '直播间专属价', desc: '抖音/淘宝直播专属折扣码限时发放', x: 140, y: -260, difficulty: 3, innovation: 5, practicality: 8, category: '渠道', parentId: 1, children: [6] },
      { id: 5, name: '新用户首单免邮', desc: '拉新成本控制在免邮范围内', x: 420, y: -180, difficulty: 2, innovation: 4, practicality: 7, category: '拉新', parentId: 1, children: [] },
      { id: 6, name: '抖音/小红书同步', desc: '跨平台短视频挂载商品链接', x: 280, y: -420, difficulty: 4, innovation: 5, practicality: 7, category: '渠道', parentId: 4, children: [] },
      { id: 7, name: '前 100 名送赠品', desc: '开门红首小时下单前 100 送定制周边', x: -560, y: -20, difficulty: 2, innovation: 4, practicality: 6, category: '预热', parentId: 1, children: [] },
      { id: 8, name: 'KOL 评测合作', desc: '找 3 位腰部 KOL 做产品评测引流', x: 560, y: -20, difficulty: 3, innovation: 5, practicality: 7, category: '推广', parentId: 1, children: [] },
      { id: 9, name: '6 月 1 日预热', desc: '6/1 开始发预告海报和倒计时', x: 0, y: 200, difficulty: 2, innovation: 3, practicality: 8, category: '时间线', parentId: 1, children: [] },
    ],
    edges: [
      { id: 301, from: 1, to: 2 }, { id: 302, from: 1, to: 3 },
      { id: 303, from: 1, to: 4 }, { id: 304, from: 1, to: 5 },
      { id: 305, from: 4, to: 6 }, { id: 306, from: 1, to: 7 },
      { id: 307, from: 1, to: 8 }, { id: 308, from: 1, to: 9 },
    ],
    nextId: 10,
    createdAt: '2026-06-10T10:00:00.000Z',
  },
];

console.log('写入演示数据...');
for (const session of demoSessions) {
  storage.saveSession(session);
  console.log(`  ✓ ${session.name} (${session.nodes.length} 节点)`);
}
console.log(`\n完成。共写入 ${demoSessions.length} 个会话。`);
