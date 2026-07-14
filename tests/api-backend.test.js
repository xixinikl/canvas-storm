/**
 * CanvasStorm 后端 REST API 集成测试
 * 运行方式: node tests/api-backend.test.js
 * 自动启动 Express 服务器 → 执行测试 → 关闭服务器
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 设置测试专用存储目录（必须在 require routes 之前）
process.env.DATA_DIR = path.join(__dirname, '..', 'data-test');

// 独立构建 app（避免 app.js 的自动 listen）
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/sessions', require('../server/routes/sessions'));
app.use('/api/storm', require('../server/routes/storm'));
app.use('/api/users', require('../server/routes/users'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/app-version', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'index.html');
  const stat = fs.statSync(indexPath);
  res.json({ code: 200, data: { version: `${Math.round(stat.mtimeMs)}-${stat.size}` } });
});

let server;
let BASE;
const createdIds = []; // 追踪创建的 session ID 用于清理

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

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function cleanup() {
  const fs = require('fs');
  const dir = process.env.DATA_DIR;
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ============ 启动服务器 ============
async function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE = `http://localhost:${port}`;
      resolve();
    });
    server.on('error', reject);
  });
}

// ============ 测试用例 ============
async function runTests() {
  console.log('\n=== 测试 1: Health Check ===');
  {
    const { status, data } = await api('GET', '/api/health');
    assert(status === 200, `health 返回 200，实际 ${status}`);
    assert(data && data.status === 'ok', `health 返回 ok，实际 ${JSON.stringify(data)}`);
  }

  console.log('\n=== 测试 1.1: AI 状态不暴露密钥 ===');
  {
    const oldKey = process.env.DEEPSEEK_API_KEY;
    const oldModel = process.env.DEEPSEEK_MODEL;
    delete process.env.DEEPSEEK_API_KEY;
    process.env.DEEPSEEK_MODEL = 'deepseek-test';
    const { status, data } = await api('GET', '/api/storm/status');
    assert(status === 200, `AI status 返回 200，实际 ${status}`);
    assert(data.data.configured === false, '未配置 key 时 configured=false');
    assert(data.data.model === 'deepseek-test', '返回模型名');
    assert(!JSON.stringify(data).includes('sk-'), '响应不包含密钥');

    process.env.DEEPSEEK_API_KEY = 'sk-test-only';
    const { data: configured } = await api('GET', '/api/storm/status');
    assert(configured.data.configured === true, '配置 key 时 configured=true');

    if (oldKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = oldKey;
    if (oldModel === undefined) delete process.env.DEEPSEEK_MODEL;
    else process.env.DEEPSEEK_MODEL = oldModel;
  }

  console.log('\n=== 测试 1.2: 页面版本接口 ===');
  {
    const { status, data } = await api('GET', '/api/app-version');
    assert(status === 200, `app-version 返回 200，实际 ${status}`);
    assert(data.code === 200, `app-version code=200，实际 ${data.code}`);
    assert(typeof data.data.version === 'string' && data.data.version.includes('-'), 'app-version 返回稳定版本号');
    assert(!JSON.stringify(data).includes('sk-'), 'app-version 不包含密钥');
  }

  console.log('\n=== 测试 1.3: 用户项目空间 API ===');
  {
    const { status, data } = await api('GET', '/api/users/api-user/projects');
    assert(status === 200, `用户项目空列表返回 200，实际 ${status}`);
    assert(Array.isArray(data.data.projects), '用户项目 data.projects 是数组');
    assert(data.data.projects.length === 0, '新用户项目列表为空');

    const projects = [
      { id: 'project_api_1', title: '线上衣橱', nodes: [{ id: 'root', title: '线上衣橱' }] },
      { id: 'project_api_2', title: '学习计划助手', nodes: [] },
    ];
    const saved = await api('PUT', '/api/users/api-user/projects', { projects });
    assert(saved.status === 200, `保存用户项目返回 200，实际 ${saved.status}`);
    assert(saved.data.data.projects.length === 2, '保存后返回 2 个项目');

    const reloaded = await api('GET', '/api/users/api-user/projects');
    assert(reloaded.data.data.projects[0].title === '线上衣橱', '可重新读取用户项目');
    const structuredProjects = [{
      id: 'project_mvp_1',
      title: 'MVP 项目',
      schemaVersion: 2,
      mvp: {
        goal: '先验证核心入口',
        mustHaveFeatures: [{ title: '核心入口', reason: '第一次使用必须成立', validation: '3 个用户手工验证' }],
        validation: '观察 3 个用户完成第一次使用',
      },
      directions: [{ nodeId: 'direction_1', title: '方向一', reason: '扩展路径', validation: '访谈验证' }],
      decisions: { ideaPool: ['direction_1'], later: [] },
      nodes: [{ id: 'root', title: 'MVP 项目', parentId: null }, { id: 'direction_1', title: '方向一', parentId: 'root', decision: 'keep' }],
    }];
    const structuredSaved = await api('PUT', '/api/users/api-user/projects', { projects: structuredProjects });
    assert(structuredSaved.status === 200, `保存 MVP-first 用户项目返回 200，实际 ${structuredSaved.status}`);
    const structuredReloaded = await api('GET', '/api/users/api-user/projects');
    assert(structuredReloaded.data.data.projects[0].mvp.goal === '先验证核心入口', '用户项目 API 保留 MVP 目标');
    assert(structuredReloaded.data.data.projects[0].directions[0].title === '方向一', '用户项目 API 保留方向列表');
    assert(structuredReloaded.data.data.projects[0].decisions.ideaPool[0] === 'direction_1', '用户项目 API 保留决策记录');

    const invalid = await api('PUT', '/api/users/api-user/projects', { projects: {} });
    assert(invalid.status === 400, `projects 非数组返回 400，实际 ${invalid.status}`);
    assert(!JSON.stringify(reloaded.data).includes('sk-'), '用户项目接口不包含密钥');
  }

  console.log('\n=== 测试 2: 空列表 ===');
  {
    const { status, data } = await api('GET', '/api/sessions');
    assert(status === 200, `空列表返回 200，实际 ${status}`);
    assert(data.code === 200, `code=200，实际 ${data.code}`);
    assert(Array.isArray(data.data), 'data 是数组');
    assert(data.data.length === 0, `空列表，实际长度 ${data.data.length}`);
  }

  console.log('\n=== 测试 3: 创建会话 (POST) ===');
  {
    const session = {
      id: 'cs_test_001',
      name: '测试会话 Alpha',
      nodes: [{ id: 'n1', title: '节点A', x: 0, y: 0 }],
      edges: [],
      nextId: 2,
      createdAt: new Date().toISOString(),
    };
    const { status, data } = await api('POST', '/api/sessions', session);
    assert(status === 200, `创建返回 200，实际 ${status}`);
    assert(data.code === 200, `code=200，实际 ${data.code}`);
    assert(data.data.name === '测试会话 Alpha', `名称匹配，实际 ${data.data.name}`);
    createdIds.push('cs_test_001');
  }

  console.log('\n=== 测试 4: 创建第二个会话 ===');
  {
    const session = {
      id: 'cs_test_002',
      name: '测试会话 Beta',
      nodes: [],
      edges: [],
      nextId: 1,
      createdAt: new Date().toISOString(),
    };
    const { status, data } = await api('POST', '/api/sessions', session);
    assert(status === 200, `创建返回 200`);
    createdIds.push('cs_test_002');
  }

  console.log('\n=== 测试 5: 获取列表 (含2条) ===');
  {
    const { status, data } = await api('GET', '/api/sessions');
    assert(status === 200, `列表返回 200`);
    assert(data.data.length === 2, `列表长度=2，实际 ${data.data.length}`);
  }

  console.log('\n=== 测试 6: 获取单个会话 (GET /:id) ===');
  {
    const { status, data } = await api('GET', '/api/sessions/cs_test_001');
    assert(status === 200, `获取单个返回 200`);
    assert(data.data.name === '测试会话 Alpha', '名称匹配');
    assert(data.data.nodes.length === 1, `节点数=1，实际 ${data.data.nodes.length}`);
    assert(data.data.nodes[0].title === '节点A', '节点标题匹配');
    assert(data.data.nextId === 2, `nextId=2，实际 ${data.data.nextId}`);
  }

  console.log('\n=== 测试 7: 获取不存在的会话 (404) ===');
  {
    const { status, data } = await api('GET', '/api/sessions/cs_nonexist');
    assert(status === 404, `返回 404，实际 ${status}`);
    assert(data.code === 404, `code=404，实际 ${data.code}`);
  }

  console.log('\n=== 测试 8: 更新会话 (PUT) ===');
  {
    const updates = { name: '测试会话 Alpha(改)', nextId: 5 };
    const { status, data } = await api('PUT', '/api/sessions/cs_test_001', updates);
    assert(status === 200, `更新返回 200`);
    assert(data.data.name === '测试会话 Alpha(改)', `名称已更新`);
    assert(data.data.nextId === 5, `nextId=5，实际 ${data.data.nextId}`);
    assert(data.data.nodes.length === 1, '原有节点未丢失');
  }

  console.log('\n=== 测试 9: 保存含大量节点/边的会话 ===');
  {
    const bigSession = {
      id: 'cs_test_003',
      name: '大会话',
      nodes: Array.from({ length: 50 }, (_, i) => ({
        id: `n${i}`, title: `节点${i}`, x: i * 10, y: i * 10,
        score: i % 5 + 1, category: i % 3 === 0 ? '技术' : '市场',
      })),
      edges: Array.from({ length: 30 }, (_, i) => ({
        id: `e${i}`, from: `n${i}`, to: `n${i + 1}`,
      })),
      nextId: 50,
      createdAt: new Date().toISOString(),
    };
    const { status } = await api('POST', '/api/sessions', bigSession);
    assert(status === 200, '大会话创建成功');
    createdIds.push('cs_test_003');

    // 读取验证
    const { data: readBack } = await api('GET', '/api/sessions/cs_test_003');
    assert(readBack.data.nodes.length === 50, `节点数=50，实际 ${readBack.data.nodes.length}`);
    assert(readBack.data.edges.length === 30, `边数=30，实际 ${readBack.data.edges.length}`);
  }

  console.log('\n=== 测试 10: 删除会话 (DELETE) ===');
  {
    const { status } = await api('DELETE', '/api/sessions/cs_test_002');
    assert(status === 200, `删除返回 200`);

    // 验证已删除
    const { status: s2, data: d2 } = await api('GET', '/api/sessions/cs_test_002');
    assert(s2 === 404, `删除后 GET 返回 404，实际 ${s2}`);

    // 列表应剩 2 条
    const { data: list } = await api('GET', '/api/sessions');
    assert(list.data.length === 2, `剩余 2 条，实际 ${list.data.length}`);
  }

  console.log('\n=== 测试 11: 删除不存在会话 ===');
  {
    const { status } = await api('DELETE', '/api/sessions/cs_nonexist');
    assert(status === 404, `删除不存在返回 404`);
  }

  console.log('\n=== 测试 12: 创建缺字段请求 (400) ===');
  {
    const { status } = await api('POST', '/api/sessions', { name: '无ID' });
    assert(status === 400, `缺 id 返回 400`);
  }

  console.log('\n=== 测试 13: 前后端数据完整性（模拟真实工作流） ===');
  {
    // 场景：用户创建会话 → 发散节点 → 保存 → 关闭 → 重新打开
    const sessionId = 'cs_workflow_test';
    createdIds.push(sessionId);

    // Step 1: 创建
    await api('POST', '/api/sessions', {
      id: sessionId, name: '工作流测试',
      nodes: [], edges: [], nextId: 1,
      createdAt: new Date().toISOString(),
    });

    // Step 2: 添加3个节点
    const nodes = [
      { id: 'root', title: '产品规划', x: 0, y: 0, score: 5, category: '产品' },
      { id: 'n1', title: '用户调研', x: 200, y: 100, score: 4, category: '调研' },
      { id: 'n2', title: '竞品分析', x: 200, y: -100, score: 3, category: '调研' },
    ];
    await api('PUT', `/api/sessions/${sessionId}`, { nodes, edges: [], nextId: 3 });

    // Step 3: 读取验证
    const { data: reloaded } = await api('GET', `/api/sessions/${sessionId}`);
    assert(reloaded.data.nodes.length === 3, `工作流节点=3`);
    assert(reloaded.data.nodes[1].title === '用户调研', '节点1标题正确');
    assert(reloaded.data.nodes[0].score === 5, 'root评分=5');
  }

  // 清理测试数据
  console.log('\n--- 清理测试会话 ---');
  for (const id of createdIds) {
    await api('DELETE', `/api/sessions/${id}`);
  }
  const { data: finalList } = await api('GET', '/api/sessions');
  assert(finalList.data.length === 0, `清理后列表为空，实际 ${finalList.data.length}`);

  // 打印结果
  console.log(`\n========================================`);
  console.log(`  结果: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log(`\n  失败详情:`);
    failures.forEach(f => console.log(`    - ${f}`));
  }
  console.log(`========================================\n`);
}

// ============ 主流程 ============
(async () => {
  try {
    cleanup();
    await startServer();
    console.log(`后端已启动: ${BASE}`);
    await runTests();
  } catch (e) {
    console.error('测试异常:', e.message);
    failed++;
  } finally {
    if (server) server.close();
    cleanup();
    process.exit(failed > 0 ? 1 : 0);
  }
})();
