// CanvasStorm — 演示数据 seed 脚本
const storage = require('../server/storage');

const demoSessions = [
  {
    id: 'seed_demo_product',
    name: '新产品头脑风暴',
    nodes: [
      { id: 1, text: 'AI 智能笔记本', x: 0, y: 0, score: 5, category: '核心概念', children: [2, 3, 4, 5] },
      { id: 2, text: '手写识别 + OCR', x: -420, y: -220, score: 4, category: '功能', children: [] },
      { id: 3, text: '语音转文字实时同步', x: -140, y: -280, score: 5, category: '功能', children: [6] },
      { id: 4, text: '跨设备云端同步', x: 140, y: -280, score: 4, category: '功能', children: [] },
      { id: 5, text: 'AI 自动生成摘要', x: 420, y: -220, score: 5, category: '功能', children: [] },
      { id: 6, text: '支持 12 种方言', x: -280, y: -440, score: 3, category: '细节', children: [] },
      { id: 7, text: '学生/白领 双版本', x: 0, y: -160, score: 4, category: '市场', children: [] },
      { id: 8, text: '硬件成本 < ¥300', x: -560, y: 0, score: 3, category: '约束', children: [] },
      { id: 9, text: 'Q3 发布众筹', x: 560, y: 0, score: 4, category: '时间线', children: [] },
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
      { id: 1, text: '官网重设计划 v2', x: 0, y: 0, score: 5, category: '项目', children: [2, 3, 4] },
      { id: 2, text: '首页全屏视频背景', x: -420, y: -200, score: 4, category: '设计', children: [5, 6] },
      { id: 3, text: '产品页 3D 展示', x: 0, y: -280, score: 5, category: '设计', children: [] },
      { id: 4, text: '博客迁移到 MDX', x: 420, y: -200, score: 3, category: '技术', children: [7] },
      { id: 5, text: '视频团队外包', x: -560, y: -380, score: 2, category: '执行', children: [] },
      { id: 6, text: '移动端适配优先', x: -280, y: -380, score: 5, category: '设计', children: [] },
      { id: 7, text: 'Next.js SSG', x: 560, y: -380, score: 4, category: '技术', children: [] },
      { id: 8, text: '6 月底上线', x: 0, y: 220, score: 4, category: '时间', children: [] },
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
      { id: 1, text: '618 大促方案', x: 0, y: 0, score: 5, category: '主题', children: [2, 3, 4, 5] },
      { id: 2, text: '满 300 减 50', x: -420, y: -180, score: 5, category: '优惠', children: [] },
      { id: 3, text: '会员双倍积分', x: -140, y: -260, score: 4, category: '权益', children: [] },
      { id: 4, text: '直播间专属价', x: 140, y: -260, score: 4, category: '渠道', children: [6] },
      { id: 5, text: '新用户首单免邮', x: 420, y: -180, score: 3, category: '拉新', children: [] },
      { id: 6, text: '抖音/小红书同步', x: 280, y: -420, score: 3, category: '渠道', children: [] },
      { id: 7, text: '前 100 名送赠品', x: -560, y: -20, score: 4, category: '预热', children: [] },
      { id: 8, text: 'KOL 评测合作', x: 560, y: -20, score: 3, category: '推广', children: [] },
      { id: 9, text: '6 月 1 日预热', x: 0, y: 200, score: 4, category: '时间线', children: [] },
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
