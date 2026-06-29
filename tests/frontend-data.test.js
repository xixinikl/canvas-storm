/**
 * CanvasStorm 前端数据层单元测试 (v2)
 * 使用 jsdom 模拟浏览器环境，预置所有 DOM 桩元素
 * 运行方式: node tests/frontend-data.test.js
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// 读取 index.html 脚本内容
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.error('未找到 <script> 标签'); process.exit(1); }
const scriptContent = scriptMatch[1];

// ============ Mock 内存存储 ============
const serverStore = new Map();

function mockFetchResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function createMockFetch() {
  return async function mockFetch(url, opts = {}) {
    const method = opts.method || 'GET';
    const path = url.replace(/^https?:\/\/[^/]+\/api/, '');

    if (method === 'GET' && path === '/health') return mockFetchResponse({ status: 'ok' });
    if (method === 'GET' && path === '/sessions') {
      const list = Array.from(serverStore.values()).map(s => ({ id: s.id, name: s.name, createdAt: s.createdAt }));
      return mockFetchResponse({ code: 200, data: list });
    }
    const getMatch = path.match(/^\/sessions\/(.+)$/);
    if (method === 'GET' && getMatch) {
      return serverStore.has(getMatch[1])
        ? mockFetchResponse({ code: 200, data: serverStore.get(getMatch[1]) })
        : mockFetchResponse({ code: 404, message: '不存在' }, 404);
    }
    if (method === 'POST' && path === '/sessions') {
      const body = JSON.parse(opts.body || '{}');
      serverStore.set(body.id, body);
      return mockFetchResponse({ code: 200, data: body });
    }
    const putMatch = path.match(/^\/sessions\/(.+)$/);
    if (method === 'PUT' && putMatch) {
      const id = putMatch[1];
      const body = JSON.parse(opts.body || '{}');
      if (serverStore.has(id)) {
        const updated = { ...serverStore.get(id), ...body, id };
        serverStore.set(id, updated);
        return mockFetchResponse({ code: 200, data: updated });
      }
      return mockFetchResponse({ code: 404, message: '不存在' }, 404);
    }
    const delMatch = path.match(/^\/sessions\/(.+)$/);
    if (method === 'DELETE' && delMatch) {
      if (serverStore.has(delMatch[1])) {
        serverStore.delete(delMatch[1]);
        return mockFetchResponse({ code: 200, message: '已删除' });
      }
      return mockFetchResponse({ code: 404, message: '不存在' }, 404);
    }
    return mockFetchResponse({ code: 500, message: '未知' }, 500);
  };
}

// ============ 测试工具 ============
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, msg) {
  if (condition) { passed++; return; }
  failed++;
  failures.push(msg);
  console.error(`  FAIL: ${msg}`);
}

// 构建包含所有 DOM 桩的测试 HTML
function buildTestHTML() {
  return `<!DOCTYPE html>
<html><body>
<div id="sessionPanel"></div>
<div id="sessionList"></div>
<div id="canvasContainer" style="width:1200px;height:800px"></div>
<canvas id="canvasLayer" width="1200" height="800"></canvas>
<svg id="edgesSvg"></svg>
<span id="zoomInfo"></span>
<div id="entryOverlay" class="hidden"></div>
<div id="ctxMenu" class="hidden"></div>
<div id="thinkingBar" class="hidden"></div>
<button id="btnUndo">撤回</button>
<button id="btnLaunch">开始发散</button>
<input id="projectInput" />
<input id="apiKeyInput" />
<select id="styleSelect"><option></option></select>
<select id="countInput"><option value="3">3</option></select>
<div id="toast"></div>
<script>${scriptContent}</script>
</body></html>`;
}

// ============ 测试套件 ============
async function runTests() {
  // ---- 套件 1: localStorage 基础读写（离线环境） ----
  console.log('\n=== 套件 1: localStorage 基础读写 ===');
  {
    const html = buildTestHTML();
    const dom = new JSDOM(html, {
      url: 'http://localhost:5500',
      runScripts: 'dangerously',
      beforeParse(window) {
        window.fetch = async () => { throw new Error('离线'); };
      },
    });
    const ctx = dom.window;
    await new Promise(r => setTimeout(r, 300));

    assert(ctx.apiOnline === false, '离线时 apiOnline=false');
    assert(Array.isArray(ctx.loadSessions()), 'loadSessions 返回数组');
    assert(ctx.loadSessions().length === 0, '初始空');

    ctx.saveSessions([{ id: 'off_1', name: '离线' }]);
    assert(ctx.loadSessions().length === 1, '写入后读取1条');
    assert(ctx.loadSessions()[0].name === '离线', '数据完整');

    ctx.localStorage.setItem('cs_sessions', 'bad json{{');
    assert(ctx.loadSessions().length === 0, '损坏数据返回[]');

    ctx.setActiveId('id_123');
    assert(ctx.getActiveId() === 'id_123', 'setActiveId/getActiveId 正确');
  }

  // ---- 套件 2: API 在线时 createNewSession 双写 ----
  console.log('\n=== 套件 2: createNewSession API双写 ===');
  {
    serverStore.clear();
    const html = buildTestHTML();
    const dom = new JSDOM(html, {
      url: 'http://localhost:5500',
      runScripts: 'dangerously',
      beforeParse(window) {
        window.fetch = createMockFetch();
      },
    });
    const ctx = dom.window;
    await new Promise(r => setTimeout(r, 300));

    assert(ctx.apiOnline === true, '在线时 apiOnline=true');

    ctx.prompt = () => '新建测试';
    ctx.createNewSession();

    const sessions = ctx.loadSessions();
    assert(sessions.length === 1, `localStorage 写入: ${sessions.length}条`);
    assert(sessions[0].name === '新建测试', `名称: ${sessions[0].name}`);
    assert(sessions[0].nextId === 1, `nextId: ${sessions[0].nextId}`);
    assert(Array.isArray(sessions[0].nodes), 'nodes 是数组');
    assert(Array.isArray(sessions[0].edges), 'edges 是数组');

    await new Promise(r => setTimeout(r, 200));
    assert(serverStore.has(sessions[0].id), '后端已存储');

    const serverSess = serverStore.get(sessions[0].id);
    assert(serverSess.name === '新建测试', '后端名称一致');
    assert(serverSess.nextId === 1, '后端 nextId 一致');
  }

  // ---- 套件 3: saveCurrentSession 更新与双写 ----
  console.log('\n=== 套件 3: saveCurrentSession 更新双写 ===');
  {
    serverStore.clear();
    const html = buildTestHTML();
    const dom = new JSDOM(html, {
      url: 'http://localhost:5500',
      runScripts: 'dangerously',
      beforeParse(window) {
        window.fetch = createMockFetch();
      },
    });
    const ctx = dom.window;
    await new Promise(r => setTimeout(r, 300));

    // 创建会话
    ctx.prompt = () => '更新测试';
    ctx.createNewSession();
    const sessions = ctx.loadSessions();
    const sid = sessions[0].id;

    // 模拟运行时修改
    ctx.currentSession = ctx.loadSessions().find(s => s.id === sid);
    // 确保 currentSession 是可变对象
    if (!ctx.currentSession.nodes) ctx.currentSession.nodes = [];
    ctx.currentSession.nodes = [
      { id: 'n1', title: '持久化节点', x: 100, y: 200, score: 4, category: '测试' },
    ];
    ctx.currentSession.edges = [];
    ctx.currentSession.nextId = 2;
    ctx.currentSession.name = '更新测试(已改)';

    ctx.saveCurrentSession();

    const reloaded = ctx.loadSessions();
    assert(reloaded[0].name === '更新测试(已改)', `名称已更新: ${reloaded[0].name}`);
    assert(reloaded[0].nodes.length === 1, `节点数=1，实际 ${reloaded[0].nodes.length}`);
    if (reloaded[0].nodes.length > 0) {
      assert(reloaded[0].nodes[0].title === '持久化节点', '节点标题正确');
    }
    assert(reloaded[0].nextId === 2, `nextId已更新: ${reloaded[0].nextId}`);

    await new Promise(r => setTimeout(r, 200));
    if (serverStore.has(sid)) {
      const ss = serverStore.get(sid);
      assert(ss.name === '更新测试(已改)', '后端名称已同步');
      assert(ss.nodes.length === 1, '后端节点已同步');
    }
  }

  // ---- 套件 4: deleteSession 双删 ----
  console.log('\n=== 套件 4: deleteSession 双删 ===');
  {
    serverStore.clear();
    const html = buildTestHTML();
    const dom = new JSDOM(html, {
      url: 'http://localhost:5500',
      runScripts: 'dangerously',
      beforeParse(window) {
        window.fetch = createMockFetch();
      },
    });
    const ctx = dom.window;
    await new Promise(r => setTimeout(r, 300));

    ctx.confirm = () => true;
    ctx.prompt = () => '待删';

    ctx.createNewSession();
    const sessions = ctx.loadSessions();
    assert(sessions.length === 1, '创建成功');
    const sid = sessions[0].id;

    await ctx.deleteSession(sid, { stopPropagation: () => {} });

    assert(ctx.loadSessions().length === 0, 'localStorage 已清空');
    assert(!serverStore.has(sid), '后端已删除');
  }

  // ---- 套件 5: API 不可用降级 ----
  console.log('\n=== 套件 5: API 不可用降级 ===');
  {
    serverStore.clear();
    const html = buildTestHTML();
    const dom = new JSDOM(html, {
      url: 'http://localhost:5500',
      runScripts: 'dangerously',
      beforeParse(window) {
        window.fetch = async () => { throw new Error('断网'); };
      },
    });
    const ctx = dom.window;
    await new Promise(r => setTimeout(r, 300));

    assert(ctx.apiOnline === false, 'apiOnline=false');

    // createNewSession 仍需工作（纯 localStorage）
    ctx.prompt = () => '降级测试';
    ctx.createNewSession();
    const sessions = ctx.loadSessions();
    assert(sessions.length === 1, '离线创建成功');
    assert(sessions[0].name === '降级测试', '数据正确');
    assert(serverStore.size === 0, '后端无数据（未同步）');
  }

  // ---- 套件 6: 复杂数据完整性 ----
  console.log('\n=== 套件 6: 复杂数据完整性 ===');
  {
    const html = buildTestHTML();
    const dom = new JSDOM(html, {
      url: 'http://localhost:5500',
      runScripts: 'dangerously',
      beforeParse(window) {
        window.fetch = async () => { throw new Error('离线'); };
      },
    });
    const ctx = dom.window;
    await new Promise(r => setTimeout(r, 300));

    ctx.saveSessions([{
      id: 'cs_full',
      name: '完整数据',
      nodes: [
        { id: 'r1', title: '根', x: 400, y: 300, score: 5, category: '核心', description: '描述文本' },
        { id: 'c1', title: '子A', x: 600, y: 200, score: 4, category: '分支', description: '' },
        { id: 'c2', title: '子B', x: 600, y: 400, score: 3, category: '分支' },
      ],
      edges: [
        { id: 'e1', from: 'r1', to: 'c1' },
        { id: 'e2', from: 'r1', to: 'c2' },
      ],
      nextId: 4,
      createdAt: '2026-06-29T10:00:00.000Z',
    }]);

    const s = ctx.loadSessions()[0];
    assert(s.nodes.length === 3, `3节点: ${s.nodes.length}`);
    assert(s.edges.length === 2, `2边: ${s.edges.length}`);
    assert(s.nodes[0].description === '描述文本', '自定义字段保留');
    assert(s.nodes[1].description === '', '空字符串字段保留');
    assert(s.edges[0].from === 'r1', '边from正确');
    assert(s.nextId === 4, 'nextId保留');
    assert(s.createdAt === '2026-06-29T10:00:00.000Z', 'createdAt保留');
  }

  // ---- 结果 ----
  console.log(`\n========================================`);
  console.log(`  前端数据层: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log(`\n  失败:`);
    failures.forEach(f => console.log(`    - ${f}`));
  }
  console.log(`========================================\n`);
}

(async () => {
  try { await runTests(); }
  catch (e) { console.error('异常:', e.message); failed++; }
  finally { process.exit(failed > 0 ? 1 : 0); }
})();
