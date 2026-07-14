/**
 * CanvasStorm 功能图前端数据流测试
 * 覆盖：本地登录、用户项目隔离、图形化功能树、围绕节点继续发散、保留/不做、持久化。
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let stormPostCalls = 0;
let stormPostBodies = [];
let projectGetCalls = 0;
let projectPutCalls = 0;
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, msg) {
  if (condition) {
    passed += 1;
    return;
  }
  failed += 1;
  failures.push(msg);
  console.error(`  FAIL: ${msg}`);
}

function wait(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockFetchResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function createMockFetch(options = {}) {
  const {
    aiConfigured = false,
    stormDelay = 0,
    stormPayload = null,
    stormIdeas = [
      { title: '天气穿搭推荐', desc: '按实时天气给出今日穿搭。', type: '核心功能', pain: '用户出门前需要快速决定穿什么。', validation: '手工生成 10 套搭配，看用户是否愿意照穿。' },
      { title: '通勤场景搭配', desc: '按上班、约会、运动等场景推荐组合。', type: '体验功能', pain: '用户知道衣服很多，但不知道不同场景怎么搭。', validation: '让用户选 3 个场景，观察推荐是否减少纠结。' },
      { title: '晒穿搭卡片', desc: '生成可分享的穿搭图文卡片。', type: '增长功能', pain: '用户愿意分享但不想重新排版。', validation: '发 3 张卡片样稿，看用户是否愿意发布。' },
    ],
  } = options;
  return async function mockFetch(url, opts = {}) {
    const method = opts.method || 'GET';
    const apiPath = String(url).replace(/^https?:\/\/[^/]+\/api/, '');

    if (method === 'GET' && apiPath === '/app-version') {
      return mockFetchResponse({ code: 200, data: { version: 'test-version' } });
    }

    if (method === 'GET' && apiPath === '/storm/status') {
      return mockFetchResponse({ code: 200, data: { configured: aiConfigured, model: 'deepseek-chat' } });
    }

    if (method === 'POST' && apiPath === '/storm') {
      stormPostCalls += 1;
      stormPostBodies.push(JSON.parse(opts.body || '{}'));
      if (stormDelay) await wait(stormDelay);
      if (!aiConfigured) return mockFetchResponse({ code: 500, error: 'mock AI unavailable' }, 500);
      return mockFetchResponse({
        code: 200,
        data: { choices: [{ message: { content: JSON.stringify(stormPayload || { children: stormIdeas }) } }] },
      });
    }

    if (apiPath.startsWith('/users/') && apiPath.endsWith('/projects')) {
      if (method === 'GET') {
        projectGetCalls += 1;
        return mockFetchResponse({ code: 200, data: { projects: [] } });
      }
      if (method === 'PUT') {
        projectPutCalls += 1;
        const payload = JSON.parse(opts.body || '{}');
        return mockFetchResponse({ code: 200, data: { projects: payload.projects || [] } });
      }
    }

    return mockFetchResponse({ code: 200, data: [] });
  };
}

async function createDom(options = {}) {
  stormPostCalls = 0;
  stormPostBodies = [];
  projectGetCalls = 0;
  projectPutCalls = 0;
  const dom = new JSDOM(html, {
    url: 'http://localhost:3000/',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.fetch = createMockFetch(options);
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedMarkdown = text;
          },
        },
      });
    },
  });
  await wait(350);
  return dom;
}

function visible(el) {
  return el && !el.classList.contains('hidden');
}

function nodeTop(document, title) {
  const el = [...document.querySelectorAll('.node')].find((node) => node.textContent.includes(title));
  const top = String(el?.getAttribute('style') || '').match(/top:([0-9.]+)%/);
  return top ? Number(top[1]) : null;
}

function clickChildChoice(document, title) {
  const button = [...document.querySelectorAll('.child-choice')].find((node) => node.textContent.includes(title));
  assert(Boolean(button), `可找到子功能选择：${title}`);
  button?.click();
}

function clickGraphNode(document, title) {
  const node = [...document.querySelectorAll('.node')].find((item) => item.textContent.includes(title));
  assert(Boolean(node), `可找到画布节点：${title}`);
  node?.click();
}

async function runTests() {
  console.log('\n=== 前端功能图数据流测试 ===');

  const dom = await createDom();
  const { document, localStorage } = dom.window;

  console.log('--- 测试 1: 登录入口清晰 ---');
  assert(visible(document.querySelector('#authView')), '默认显示登录页');
  assert(document.querySelector('.auth-title')?.textContent.includes('功能图'), '登录页说明产品是功能图');
  assert(document.querySelector('.auth-graph-preview')?.textContent.includes('一键穿搭'), '登录页展示具体功能图预览');
  assert(document.querySelector('.login-card')?.textContent.includes('进入你的功能图空间'), '登录入口直接说明进入功能图空间');
  assert(document.querySelector('.login-badge')?.textContent.includes('项目记录'), '登录入口使用用户可理解的项目记录语言');
  assert(!document.querySelector('.login-card')?.textContent.includes('无需密码'), '登录入口不再使用工程化解释文案');
  assert(!document.querySelector('.login-card')?.textContent.includes('本地演示登录'), '登录入口不再使用演示登录文案');
  assert(!document.querySelector('.login-card')?.textContent.includes('演示用户'), '登录入口不再露出演示用户芯片');
  assert(document.querySelector('.login-card')?.textContent.includes('独立开发者'), '登录入口提供真实角色快捷入口');
  assert(document.querySelector('#appView')?.classList.contains('hidden'), '未登录不显示工作台');

  const emptyNameDom = await createDom();
  const emptyNameDocument = emptyNameDom.window.document;
  emptyNameDocument.querySelector('#loginBtn').click();
  await wait(160);
  assert(emptyNameDocument.querySelector('#userName')?.textContent === '我的空间', '空用户名默认进入我的空间而不是演示用户');

  console.log('--- 测试 1.1: 键盘可进入项目空间 ---');
  const keyboardDom = await createDom();
  const keyboardDocument = keyboardDom.window.document;
  keyboardDocument.querySelector('#loginName').value = '键盘用户';
  keyboardDocument.querySelector('#loginName').dispatchEvent(new keyboardDom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await wait(250);
  assert(!keyboardDocument.querySelector('#appView')?.classList.contains('hidden'), '用户名输入框按 Enter 可进入项目空间');

  console.log('--- 测试 2: 进入用户项目空间 ---');
  document.querySelector('[data-login="米朵"]').click();
  await wait(250);
  assert(visible(document.querySelector('#appView')), '登录后显示工作台');
  assert(document.querySelector('#userName')?.textContent === '米朵', '显示当前用户');
  assert(projectGetCalls >= 1, '登录时会尝试从后端读取用户项目');
  assert(document.querySelectorAll('.project-card').length >= 3, '默认项目记录已创建');
  assert(document.querySelector('.project-card')?.getAttribute('title')?.includes('线上衣橱'), '项目卡保留完整标题，便于小屏截断时识别');
  assert(document.querySelector('.project-card')?.getAttribute('aria-label')?.includes('打开项目'), '项目卡有明确打开项目语义');
  assert(document.querySelector('#projectTitle')?.textContent.includes('线上衣橱'), '默认打开用户更容易理解的线上衣橱示例');
  assert(document.querySelectorAll('.node').length >= 4, '首屏展示中心节点和第一层方向');
  assert(document.querySelector('#projectKicker')?.textContent.includes('当前层：功能方向'), '顶部明确当前层是功能方向');
  assert(document.querySelector('#projectDesc')?.textContent.includes('点击方向卡片会进入它的下一层'), '页面说明点击方向卡片才进入下一层');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('推荐方向'), '右侧只提示推荐方向，不自动跳层');
  assert(document.querySelector('#expandSelected')?.textContent.includes('补充这一层'), '主动作是补充当前层方向');
  assert(!document.querySelector('#actionDock')?.classList.contains('show-proof'), '选方向阶段不展开取舍依据，保持界面轻');
  assert(document.querySelector('#flowProject')?.textContent.includes('线上衣橱'), '顶部流程显示当前项目');
  assert(document.querySelector('#flowNode')?.textContent.includes('线上衣橱'), '顶部流程显示当前节点');
  assert(document.querySelector('#flowDirectionStep')?.classList.contains('active'), '默认处在选方向步骤');
  assert(document.querySelector('#appView')?.dataset.stage === '2', '工作台标记当前阶段，移动端可隐藏次要详情');
  assert(document.querySelector('#flowExpandStep')?.textContent.includes('生成下一层'), '流程轨道显示下一层拆解步骤');
  assert(document.querySelectorAll('button.node').length === 0, '功能节点不是 button，避免嵌套按钮');
  assert(document.querySelectorAll('.node button[data-expand]').length === 0, '节点只负责选择，推进动作统一放在命令条');
  assert(!document.querySelector('#graphSvg')?.innerHTML.includes('%'), 'SVG 连线使用 viewBox 数值坐标');
  assert(document.querySelector('.node.root')?.textContent.includes('线上衣橱'), '中心节点是具体项目点');
  assert(document.querySelector('.node.root')?.classList.contains('in-path'), '默认中心节点在当前路径中');
  assert(document.querySelectorAll('.node.recommended').length === 1, '默认只突出一个推荐方向');
  assert(document.querySelector('.node.recommended')?.textContent.includes('一键穿搭'), '推荐方向是最适合先做的功能');
  assert(document.querySelector('#graphStage')?.textContent.includes('一键发穿搭'), '桌面首屏保留原始需求里的社交发布方向');
  assert(document.querySelector('#graphStage')?.textContent.includes('旅行打包清单'), '首层保留同层方向，用户可以自己选择');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('点击画布上的这个节点'), '推荐只解释如何进入，不替用户跳转');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('第 2 步'), '右侧操作面板显示当前步骤');
  assert(document.querySelector('#decisionBoard')?.textContent.includes('灵感备选'), '结果摘要强调灵感备选库，而不是强迫只留一个');
  assert(document.querySelector('#mvpOverview')?.textContent.includes('核心 MVP'), '首屏明确展示核心 MVP 区块');
  assert(document.querySelector('#mvpOverview')?.textContent.includes('发散方向'), '首屏明确展示发散方向区块');
  assert(document.querySelector('#mvpOverview')?.textContent.includes('一键穿搭'), '首屏方向区展示可选择的一层方向');
  assert(document.querySelector('#mvpOverview')?.textContent.includes('进入下一层'), '方向区明确点击方向才进入下一层');
  assert(document.querySelectorAll('#mvpOverview [data-focus-direction]').length >= 3, '首屏方向区提供多个方向入口');
  const firstUserProjects = JSON.parse(localStorage.getItem('cs_graph_projects_米朵') || '[]');
  const wardrobe = firstUserProjects.find((project) => project.title === '线上衣橱');
  assert(document.querySelector('#mapNodeCount')?.textContent === String(wardrobe?.nodes.length), '功能图状态条保留完整项目节点数');
  assert(wardrobe?.layoutVersion === 4, '项目布局版本已迁移到新版');
  assert(wardrobe?.schemaVersion === 2, '项目数据模型已迁移到 MVP-first schema v2');
  assert(wardrobe?.mvp?.rootNodeId, '项目包含 MVP 主线根节点引用');
  assert(wardrobe?.mvp?.mustHaveFeatures?.length >= 1, '项目 MVP 主线包含至少一个必做功能');
  assert(wardrobe?.directions?.some((direction) => direction.title === '一键穿搭'), '项目方向列表包含一级功能方向');
  assert(wardrobe?.nodes.find((node) => node.title === '线上衣橱')?.role === 'project', '中心节点标记为 project 角色');
  const outfit = wardrobe?.nodes.find((node) => node.title === '一键穿搭');
  assert(outfit?.role === 'direction', '一级节点标记为 direction 角色');
  assert(outfit?.x === 17 && outfit?.y === 30, '线上衣橱示例使用不重叠的新版节点位置');
  assert(document.querySelector('#aiStatus')?.textContent.includes('本地示例'), 'AI 状态显示本地示例模式');
  [...document.querySelectorAll('#mvpOverview [data-focus-direction]')].find((button) => button.textContent.includes('拍照入库'))?.click();
  await wait(80);
  assert(document.querySelector('#flowNode')?.textContent.includes('拍照入库'), '点击首屏方向区可直接进入对应方向');
  clickGraphNode(document, '线上衣橱');
  await wait(80);

  console.log('--- 测试 3: 围绕节点继续发散 ---');
  clickGraphNode(document, '一键穿搭');
  await wait(80);
  assert(document.querySelector('#flowNode')?.textContent.includes('一键穿搭'), '点击画布节点后进入该方向');
  assert(document.querySelector('.node.active')?.textContent.includes('一键穿搭'), '当前方向节点成为画布当前节点');
  assert(document.querySelector('#flowExpandStep')?.classList.contains('active'), '进入具体方向后准备生成子功能');
  assert(document.querySelector('#appView')?.dataset.stage === '3', '当前方向没有子节点时进入生成子功能阶段');
  assert(document.querySelector('#expandSelected')?.textContent.includes('生成子功能'), '右侧主按钮明确为当前节点生成子功能');
  assert(document.querySelector('#canvasActionHint')?.textContent.includes('只作用于当前方向'), '生成子功能阶段说明底部按钮不会补充别的方向');
  assert(!document.querySelector('#graphStage')?.textContent.includes('旅行打包清单'), '进入方向后不再混入同层其他方向');
  const beforeNodes = document.querySelectorAll('.node').length;
  const beforeTotalNodes = Number(document.querySelector('#mapNodeCount')?.textContent || '0');
  document.querySelector('#expandSelected').click();
  await wait(350);
  assert(stormPostCalls === 0, 'AI 未配置时不调用 /storm POST');
  assert(Number(document.querySelector('#mapNodeCount')?.textContent || '0') === beforeTotalNodes + 3, '从具体功能点继续生成 3 个下一层功能');
  const generatedProjects = JSON.parse(localStorage.getItem('cs_graph_projects_米朵') || '[]');
  const generatedWardrobe = generatedProjects.find((project) => project.title === '线上衣橱');
  assert(generatedWardrobe?.nodes.some((node) => node.title === '天气穿搭推荐' && node.role === 'feature'), '方向下生成的下一层节点标记为 feature 角色');
  assert(document.querySelectorAll('.node').length >= beforeNodes, '生成后画布保留当前路径和当前层子功能');
  assert(document.querySelectorAll('.node.in-path').length >= 2, '发散后当前节点和上游节点会高亮成路径');
  assert(document.querySelectorAll('.node.dimmed').length === 0, '深入后隐藏无关分支，减少视觉干扰');
  assert(document.querySelector('#flowDecisionStep')?.classList.contains('active'), '生成下一层后进入收藏点子步骤');
  assert(document.querySelector('#appView')?.dataset.stage === '4', '生成下一层后进入点子选择阶段，移动端再显示详情');
  assert(document.querySelector('.child-choice-list')?.textContent.includes('建议进入'), '生成后右侧直接列出建议进入的子功能选择');
  assert(document.querySelector('.child-choice-list')?.textContent.includes('进入下一层'), '子功能列表说明点击卡片才进入下一层');
  assert(document.querySelector('.node.recommended')?.textContent.includes('天气穿搭推荐'), '生成后推荐落到当前这一层的子功能');
  assert(document.querySelector('.node.recommended')?.textContent.includes('建议进入'), '画布推荐节点标明这是进入下一层的选择');
  assert(nodeTop(document, '天气穿搭推荐') > nodeTop(document, '一键穿搭') + 16, '生成后推荐子功能下移成独立层级，不压住父方向');
  assert(document.querySelector('#projectTitle')?.textContent.includes('子功能'), '生成后页面明确展示当前节点的子功能层');
  assert(document.querySelector('#projectDesc')?.textContent.includes('底部按钮只补充这一层子功能'), '生成后说明底部按钮只补当前节点这一层');
  assert(document.querySelector('#expandSelected')?.textContent.includes('补充这一层'), '生成后右侧主按钮不再伪装成进入下一层');
  assert(document.querySelector('#actionDock')?.textContent.includes('补充这一层'), '生成后底部主动作保持补充当前层语义');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('推荐动作'), '右侧显示推荐动作，帮助用户继续找思路');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('为什么'), '右侧显示当前节点决策详情');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('验证'), '右侧显示当前节点验证动作');
  const parsed = dom.window.parseIdeaArray('```json\\n[{"title":"试衣间模拟","desc":"上传自拍后预览穿搭效果。"}]\\n```');
  assert(parsed.length === 1 && parsed[0].title === '试衣间模拟', 'AI markdown JSON 可解析');
  const parsedContract = dom.window.parseGenerationPayload('```json\\n{"mvp":{"goal":"先验证一键穿搭"},"directions":[{"title":"方向A","desc":"说明"}]}\\n```');
  assert(parsedContract.mvp?.goal === '先验证一键穿搭', 'AI MVP-first JSON 对象可解析');
  const parsedDirections = dom.window.parseIdeaArray(JSON.stringify({ directions: [{ title: '方向B', desc: '说明' }] }));
  assert(parsedDirections[0]?.title === '方向B', '旧数组解析入口兼容 MVP-first directions 对象');
  const ranked = dom.window.rankRecommendationNodes([
    { title: '穿搭评分与反馈', desc: '记录用户评分并优化推荐。', type: '核心功能', decision: 'maybe' },
    { title: '一键社交发布卡片', desc: '把今日穿搭生成可分享图片。', type: '增长功能', decision: 'maybe' },
    { title: '旅行衣物清单', desc: '按目的地生成要带的衣服组合。', type: '体验功能', decision: 'maybe' },
    { title: '旅行打包清单', desc: '按目的地生成要带的衣服组合。', type: '延展功能', decision: 'maybe' },
  ]);
  assert(ranked[0].title !== '穿搭评分与反馈', '推荐排序不会默认把评分反馈类机制放在直观功能入口前面');
  assert(ranked.findIndex((node) => node.title === '一键社交发布卡片') < ranked.findIndex((node) => node.title === '旅行打包清单'), '增长方向优先于延展方向，避免首屏偏离主线');

  console.log('--- 测试 4: 收藏多个备选和以后再看同步到侧栏 ---');
  document.querySelector('.child-choice.recommended-choice').click();
  await wait(80);
  assert(document.querySelector('#nodeDetail h2')?.textContent.includes('天气穿搭推荐'), '点推荐子功能后进入该功能详情');
  document.querySelector('#keepNode').click();
  await wait(80);
  assert(document.querySelector('#projectTitle')?.textContent.includes('加入备选库'), '收藏后顶部进入已加入备选库状态');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('已加入备选'), '收藏后右侧显示已加入备选');
  assert(document.querySelector('#expandSelected')?.textContent.includes('回到上一层'), '保留后主动作变成回到上一层');
  assert(document.querySelector('.decision-title')?.textContent.includes('灵感备选库'), '右侧显示灵感备选区');
  assert(document.querySelector('#decisionBoard')?.textContent.includes('灵感备选'), '结果摘要显示灵感备选区');
  assert(document.querySelector('#decisionBoard')?.textContent.includes(document.querySelector('#nodeDetail h2')?.textContent), '收藏项进入备选库');
  document.querySelector('#expandSelected').click();
  await wait(80);
  assert(Boolean(document.querySelector('.child-choice:not(.recommended-choice)')), '回到上一层后仍可比较其他子功能');
  clickChildChoice(document, '重复率提醒');
  await wait(80);
  document.querySelector('#keepNode').click();
  await wait(80);
  assert(document.querySelector('#nodeDetail')?.textContent.includes('已加入备选'), '可以继续把第二个子功能加入备选库，不强迫只留一个');
  assert((document.querySelector('#decisionBoard')?.textContent.match(/天气穿搭推荐|重复率提醒|社交图片生成/g) || []).length >= 2, '备选库允许收藏多个功能点');
  document.querySelector('#expandSelected').click();
  await wait(80);
  clickChildChoice(document, '社交图片生成');
  await wait(80);
  document.querySelector('#dropNode').click();
  await wait(80);
  assert(document.querySelector('#projectTitle')?.textContent.includes('以后再看'), '暂缓后顶部进入以后再看状态');
  assert(document.querySelector('#nodeDetail')?.textContent.includes('已放到以后'), '暂缓后右侧显示已放到以后');
  assert(document.querySelector('#decisionBoard')?.textContent.includes('以后再看'), '右侧显示以后再看区');
  assert(document.querySelector('#decisionBoard')?.textContent.includes(document.querySelector('#nodeDetail h2')?.textContent), '暂缓项进入以后再看清单');

  console.log('--- 测试 5: 编辑、手动添加、删除和导出 ---');
  document.querySelector('#expandSelected').click();
  await wait(80);
  document.querySelector('#detailAddChild').click();
  await wait(60);
  assert(!document.querySelector('#nodeModal')?.classList.contains('hidden'), '手动加点子会打开节点弹窗');
  document.querySelector('#nodeTitleInput').value = '镜前预览';
  document.querySelector('#nodeTypeInput').value = '体验功能';
  document.querySelector('#nodeDescInput').value = '用已有衣服快速生成镜前预览图。';
  document.querySelector('#nodePainInput').value = '用户不知道一套搭配穿上身是否合适。';
  document.querySelector('#nodeValidationInput').value = '手工做 5 张预览图，看用户是否愿意保存。';
  document.querySelector('#saveNodeBtn').click();
  await wait(100);
  assert(document.querySelector('#nodeDetail h2')?.textContent.includes('镜前预览'), '保存手动点子后进入新功能详情');
  assert(document.querySelector('#decisionBoard')?.textContent.includes('待验证'), '手动点子进入待验证池');
  document.querySelector('#detailEditNode').click();
  await wait(60);
  document.querySelector('#nodeTitleInput').value = '镜前预览卡片';
  document.querySelector('#nodeValidationInput').value = '做 3 张卡片发给用户，让用户选是否想继续编辑。';
  document.querySelector('#saveNodeBtn').click();
  await wait(100);
  assert(document.querySelector('#nodeDetail h2')?.textContent.includes('镜前预览卡片'), '编辑功能点会更新当前详情');
  document.querySelector('#expandSelected').click();
  await wait(180);
  assert([...document.querySelectorAll('.node')].some((node) => node.textContent.includes('镜前预览卡片')), '继续发散后仍保留当前功能主线');
  document.querySelector('#exportProjectBtn').click();
  await wait(80);
  assert(dom.window.__copiedMarkdown?.includes('# 线上衣橱'), '导出会复制当前项目 Markdown');
  assert(dom.window.__copiedMarkdown?.includes('镜前预览卡片'), '导出内容包含手动编辑后的功能点');
  document.querySelector('#detailDeleteNode').click();
  await wait(100);
  assert(!document.querySelector('#nodeDetail h2')?.textContent.includes('镜前预览卡片'), '删除功能点后回到上一层');
  assert(!document.querySelector('#decisionBoard')?.textContent.includes('镜前预览卡片'), '删除功能点会从备选摘要中移除');

  console.log('--- 测试 6: 创建新项目并持久化 ---');
  document.querySelector('#topNewProjectBtn').click();
  await wait(60);
  assert(!document.querySelector('#projectModal')?.classList.contains('hidden'), '顶部新建功能图会打开创建弹窗');
  assert(document.body.classList.contains('modal-open'), '创建弹窗打开时锁定背景操作');
  assert(document.querySelector('#projectModalTitle')?.textContent.includes('新建功能图'), '创建弹窗标题短而明确');
  assert(!document.querySelector('.modal-head')?.textContent.includes('不要一开始列功能'), '创建弹窗不再堆长说明文案');
  assert(document.querySelector('.creation-hint')?.textContent.includes('先看一个'), '创建弹窗解释创建后的探索流程');
  document.querySelector('[data-project-example="wardrobe"]').click();
  assert(document.querySelector('#newProjectTitle')?.value === '线上衣橱', '创建弹窗可用示例快速填充项目点');
  document.querySelector('#newProjectTitle').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert(document.activeElement === document.querySelector('#newProjectSeed'), '项目点按 Enter 会进入真实场景输入');
  document.querySelector('#newProjectTitle').value = '个人知识库';
  document.querySelector('#newProjectSeed').value = '把收藏、笔记、灵感统一整理，并能继续发散写作选题。';
  document.querySelector('#newProjectSeed').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }));
  await wait(100);
  assert(document.querySelector('#projectTitle')?.textContent.includes('个人知识库'), '新项目成为当前项目');
  assert(document.querySelector('#toast')?.textContent.includes('已创建“个人知识库”功能图'), '创建后反馈当前新项目，避免残留上一轮操作提示');
  assert(document.querySelector('#projectModal')?.classList.contains('hidden'), '创建后自动关闭弹窗');
  assert(!document.body.classList.contains('modal-open'), '创建后恢复背景操作状态');
  assert(document.querySelector('.node.root')?.textContent.includes('个人知识库'), '新项目生成中心节点');
  assert(document.querySelectorAll('.node').length > 1, '新项目创建后立即带出第一层功能分支');
  assert(document.querySelector('#graphStage')?.textContent.includes('写作选题发散'), '知识库项目生成贴合场景的功能分支');
  const userProjects = JSON.parse(localStorage.getItem('cs_graph_projects_米朵') || '[]');
  const knowledgeProject = userProjects.find((project) => project.title === '个人知识库');
  assert(Boolean(knowledgeProject), '新项目已保存到当前用户空间');
  assert(knowledgeProject?.schemaVersion === 2, '新建项目使用 MVP-first schema v2');
  assert(knowledgeProject?.mvp?.mustHaveFeatures?.length >= 1, '新建项目自动生成 MVP 主线');
  assert(knowledgeProject?.directions?.length >= 1, '新建项目自动生成发散方向列表');
  await wait(450);
  assert(projectPutCalls >= 1, '项目变化会同步到后端用户项目空间');

  document.querySelector('#topNewProjectBtn').click();
  await wait(60);
  document.querySelector('#newProjectTitle').value = '咖啡店排班';
  document.querySelector('#newProjectSeed').value = '根据员工可用时间、客流高峰和请假情况，帮店长安排一周班表。';
  document.querySelector('#createProjectBtn').click();
  await wait(120);
  assert(document.querySelector('#projectTitle')?.textContent.includes('咖啡店排班'), '可创建门店排班类真实场景项目');
  assert(document.querySelector('#graphStage')?.textContent.includes('一键生成周班表'), '排班项目生成贴合门店排班的核心功能');
  assert(document.querySelector('#graphStage')?.textContent.includes('换班冲突提醒'), '排班项目生成贴合临时换班的真实痛点');
  assert(!document.querySelector('#graphStage')?.textContent.includes('最小录入流程'), '排班项目不落入泛化兜底功能名');

  console.log('--- 测试 6: 不同用户项目隔离 ---');
  document.querySelector('#logoutBtn').click();
  await wait(80);
  assert(document.querySelector('#recentSpaces')?.textContent.includes('米朵'), '退出后登录页显示最近项目空间');
  assert(document.querySelector('#recentSpaces')?.textContent.includes('咖啡店排班'), '最近项目空间显示当前最新项目');
  document.querySelector('#recentSpaces [data-login="米朵"]').click();
  await wait(160);
  assert(document.querySelector('#userName')?.textContent === '米朵', '可从最近项目空间继续进入用户记录');
  document.querySelector('#logoutBtn').click();
  await wait(80);
  document.querySelector('[data-login="产品同学"]').click();
  await wait(180);
  const otherProjects = JSON.parse(localStorage.getItem('cs_graph_projects_产品同学') || '[]');
  assert(otherProjects.length >= 2, '另一个用户有自己的默认项目');
  assert(!otherProjects.some((project) => project.title === '个人知识库'), '另一个用户看不到米朵的新项目');
  assert(document.querySelector('#userName')?.textContent === '产品同学', '已切换到另一个用户');

  console.log('--- 测试 6.1: 旧项目自动迁移到 MVP-first 结构 ---');
  const legacyDom = await createDom();
  const legacyStorage = legacyDom.window.localStorage;
  legacyStorage.setItem('cs_graph_projects_旧用户', JSON.stringify([{
    id: 'legacy-project',
    title: '旧项目',
    seed: '旧结构只有 nodes，没有 mvp 和 directions。',
    nodes: [
      { id: 'legacy-root', title: '旧项目', desc: '旧中心想法', parentId: null, x: 50, y: 50, type: '中心想法', pain: '旧痛点', validation: '旧验证', decision: 'keep' },
      { id: 'legacy-child', title: '旧方向', desc: '旧一级方向', parentId: 'legacy-root', x: 30, y: 30, type: '核心功能', pain: '旧方向痛点', validation: '旧方向验证', decision: 'maybe' },
    ],
    layoutVersion: 1,
    activeNodeId: 'legacy-root',
  }]));
  legacyDom.window.document.querySelector('#loginName').value = '旧用户';
  legacyDom.window.document.querySelector('#loginBtn').click();
  await wait(220);
  const migrated = JSON.parse(legacyStorage.getItem('cs_graph_projects_旧用户') || '[]').find((project) => project.id === 'legacy-project');
  assert(migrated?.schemaVersion === 2, '旧项目登录后自动补齐 schema v2');
  assert(migrated?.mvp?.rootNodeId === 'legacy-root', '旧项目迁移后保留中心节点为 MVP 根');
  assert(migrated?.directions?.[0]?.title === '旧方向', '旧项目迁移后从一级节点生成 directions');
  assert(migrated?.nodes?.find((node) => node.id === 'legacy-child')?.role === 'direction', '旧项目一级节点迁移为 direction 角色');

  console.log('--- 测试 7: AI 生成有明确等待反馈 ---');
  const loadingDom = await createDom({ aiConfigured: true, stormDelay: 180 });
  const loadingDocument = loadingDom.window.document;
  loadingDocument.querySelector('[data-login="米朵"]').click();
  await wait(300);
  assert(loadingDocument.querySelector('#aiStatus')?.textContent.includes('AI 可用'), 'AI 可用时状态栏明确显示');
  clickGraphNode(loadingDocument, '一键穿搭');
  await wait(80);
  assert(loadingDocument.querySelector('#expandSelected')?.textContent.includes('生成子功能'), '点击方向后准备生成它的子功能');
  const loadingBeforeTotalNodes = Number(loadingDocument.querySelector('#mapNodeCount')?.textContent || '0');
  loadingDocument.querySelector('#expandSelected').click();
  await wait(20);
  assert(loadingDocument.querySelector('#expandSelected')?.textContent.includes('生成中') || loadingDocument.querySelector('#generateBtn')?.textContent.includes('生成中'), 'AI 慢响应时主按钮显示生成中');
  assert(loadingDocument.querySelector('#expandSelected')?.disabled || loadingDocument.querySelector('#generateBtn')?.disabled, 'AI 慢响应时主按钮不可重复点击');
  await wait(260);
  assert(stormPostCalls === 1, 'AI 已连接时会调用 /storm POST');
  assert(stormPostBodies[0]?.userPrompt?.includes('"children"'), '方向下发散时 AI 契约要求返回 children 对象');
  assert(Number(loadingDocument.querySelector('#mapNodeCount')?.textContent || '0') === loadingBeforeTotalNodes + 3, 'AI 返回后追加下一层功能节点');

  const rootAiDom = await createDom({
    aiConfigured: true,
    stormPayload: {
      mvp: {
        goal: '先验证最小录入',
        mustHaveFeatures: [{ title: '极简录入', reason: '用户必须先完成第一次输入。', validation: '5 个用户 3 分钟完成录入。' }],
        validation: '手工观察 5 个用户完成第一次输入。',
      },
      directions: [
        { title: '极简录入', desc: '把首次输入压到 3 分钟内。', type: '核心功能', pain: '录入太慢会流失。', validation: '5 个用户 3 分钟完成录入。' },
        { title: '结果解释', desc: '解释为什么给出这个建议。', type: '体验功能', pain: '用户不知道该不该信。', validation: '让用户标记解释是否有帮助。' },
      ],
    },
  });
  const rootWindow = rootAiDom.window;
  const rootProject = rootWindow.createProject(null, 'AI 根契约项目', '测试根节点 AI 契约。');
  const rootNode = rootProject.nodes.find((node) => !node.parentId);
  const rootIdeas = await rootWindow.aiGenerate(rootProject, rootNode, 2);
  rootWindow.addChildren(rootProject, rootNode, rootIdeas);
  assert(rootProject.mvp?.goal === '先验证最小录入', '根节点 AI 契约会写入项目 MVP 目标');
  assert(rootProject.mvp?.mustHaveFeatures?.[0]?.title === '极简录入', '根节点 AI 契约会写入 MVP 必做项');
  assert(rootProject.directions?.length === 2, '根节点 AI 契约会生成方向列表');
  assert(stormPostBodies[0]?.userPrompt?.includes('"mvp"') && stormPostBodies[0]?.userPrompt?.includes('"directions"'), '根节点发散时 AI 契约要求返回 mvp + directions 对象');

  console.log(`\n========================================`);
  console.log(`  前端功能图: ${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log('\n  失败:');
    failures.forEach((failure) => console.log(`    - ${failure}`));
  }
  console.log(`========================================\n`);
}

(async () => {
  try {
    await runTests();
  } catch (error) {
    failed += 1;
    console.error('测试异常:', error);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
})();
