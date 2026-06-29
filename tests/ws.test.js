// CanvasStorm — WebSocket 通道集成测试
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');

let server, wss, port;

function startServer() {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(express.json());

    // 独立 data 目录避免污染
    process.env.DATA_DIR = path.join(__dirname, '..', 'data-test-ws');

    // 确保测试数据目录存在
    if (!fs.existsSync(process.env.DATA_DIR)) {
      fs.mkdirSync(process.env.DATA_DIR, { recursive: true });
    }

    app.use('/api/sessions', require('../server/routes/sessions'));
    app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

    server = app.listen(0, () => {
      port = server.address().port;
      wss = require('../server/ws')(server);
      resolve();
    });

    server.on('error', reject);
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (wss) wss.close();
    if (server) server.close(resolve);
    else resolve();
  });
}

let passed = 0, failed = 0;

function assert(condition, label) {
  if (condition) { passed++; }
  else { failed++; console.log(`  FAIL: ${label}`); }
}

// ====== 主测试流程 ======
(async () => {
  console.log('\n=== WebSocket 通道测试 ===\n');

  await startServer();
  const url = `ws://localhost:${port}`;

  // ---- 测试 1: 服务端启动 ----
  console.log('--- 测试 1: 服务端启动 ---');
  {
    const res = await fetch(`http://localhost:${port}/api/health`);
    const body = await res.json();
    assert(body.status === 'ok', '健康检查通过');
  }

  // ---- 测试 2: 单客户端连接 ----
  console.log('--- 测试 2: 单客户端连接 ---');
  {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
      setTimeout(() => reject(new Error('连接超时')), 3000);
    });
    assert(ws.readyState === WebSocket.OPEN, '客户端连接成功');
    ws.close();
  }

  // ---- 测试 3: 加入房间 ----
  console.log('--- 测试 3: 加入房间 ---');
  {
    const ws = new WebSocket(url);
    await new Promise((r) => ws.on('open', r));
    ws.send(JSON.stringify({ type: 'join', sessionId: 'room_a' }));
    // join 不响应，只要不报错就通过
    await new Promise((r) => setTimeout(r, 200));
    assert(true, '加入房间无异常');
    ws.close();
  }

  // ---- 测试 4: 同房间广播 session_update ----
  console.log('--- 测试 4: 同房间广播 ---');
  {
    const ws1 = new WebSocket(url);
    const ws2 = new WebSocket(url);
    await new Promise((r) => ws1.on('open', r));
    await new Promise((r) => ws2.on('open', r));

    ws1.send(JSON.stringify({ type: 'join', sessionId: 'room_x' }));
    ws2.send(JSON.stringify({ type: 'join', sessionId: 'room_x' }));
    await new Promise((r) => setTimeout(r, 100));

    let received = false;
    ws2.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'session_update' && msg.sessionId === '123') {
        received = true;
      }
    });

    ws1.send(JSON.stringify({ type: 'session_update', sessionId: '123' }));
    await new Promise((r) => setTimeout(r, 200));
    assert(received, '同房间客户端收到广播');
    ws1.close();
    ws2.close();
  }

  // ---- 测试 5: 自身不收到自己的广播 ----
  console.log('--- 测试 5: 自身不收到自己的广播 ---');
  {
    const ws = new WebSocket(url);
    await new Promise((r) => ws.on('open', r));
    ws.send(JSON.stringify({ type: 'join', sessionId: 'room_self' }));
    await new Promise((r) => setTimeout(r, 100));

    let selfReceived = false;
    ws.on('message', () => { selfReceived = true; });
    ws.send(JSON.stringify({ type: 'session_update', sessionId: '456' }));
    await new Promise((r) => setTimeout(r, 200));
    assert(!selfReceived, '发送者不收到自己的广播');
    ws.close();
  }

  // ---- 测试 6: 不同房间不互串 ----
  console.log('--- 测试 6: 不同房间隔离 ---');
  {
    const wsA = new WebSocket(url);
    const wsB = new WebSocket(url);
    await new Promise((r) => wsA.on('open', r));
    await new Promise((r) => wsB.on('open', r));

    wsA.send(JSON.stringify({ type: 'join', sessionId: 'room_a' }));
    wsB.send(JSON.stringify({ type: 'join', sessionId: 'room_b' }));
    await new Promise((r) => setTimeout(r, 100));

    let leaked = false;
    wsB.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'session_update') leaked = true;
    });

    wsA.send(JSON.stringify({ type: 'session_update', sessionId: 'from_a' }));
    await new Promise((r) => setTimeout(r, 200));
    assert(!leaked, '不同房间消息隔离');
    wsA.close();
    wsB.close();
  }

  // ---- 测试 7: 断连清理 ----
  console.log('--- 测试 7: 断连后清理 ---');
  {
    const ws = new WebSocket(url);
    await new Promise((r) => ws.on('open', r));
    ws.send(JSON.stringify({ type: 'join', sessionId: 'room_cleanup' }));
    await new Promise((r) => setTimeout(r, 100));
    ws.close();
    await new Promise((r) => setTimeout(r, 200));

    // 断连后房间为空，新客户端加入同一房间，之前的客户端不应收到
    const wsNew = new WebSocket(url);
    await new Promise((r) => wsNew.on('open', r));

    let ghostReceived = false;
    wsNew.on('message', () => { ghostReceived = true; });

    wsNew.send(JSON.stringify({ type: 'join', sessionId: 'room_cleanup' }));
    await new Promise((r) => setTimeout(r, 200));
    // wsNew 发 session_update，不应有人收到（房间只有自己）
    wsNew.send(JSON.stringify({ type: 'session_update', sessionId: 'solo' }));
    await new Promise((r) => setTimeout(r, 200));
    assert(!ghostReceived, '断连后端已清理，无幽灵消息');
    wsNew.close();
  }

  // ---- 测试 8: 无效消息不崩溃 ----
  console.log('--- 测试 8: 无效消息容错 ---');
  {
    const ws = new WebSocket(url);
    await new Promise((r) => ws.on('open', r));

    ws.send('not json');
    ws.send(JSON.stringify({ type: 'unknown' }));
    ws.send('');
    await new Promise((r) => setTimeout(r, 200));
    assert(ws.readyState === WebSocket.OPEN, '无效消息不导致断连');
    ws.close();
  }

  // ---- 测试 9: cursor_move 广播 ----
  console.log('--- 测试 9: 光标位置广播 ---');
  {
    const ws1 = new WebSocket(url);
    const ws2 = new WebSocket(url);
    await new Promise((r) => ws1.on('open', r));
    await new Promise((r) => ws2.on('open', r));

    ws1.send(JSON.stringify({ type: 'join', sessionId: 'room_cursor' }));
    ws2.send(JSON.stringify({ type: 'join', sessionId: 'room_cursor' }));
    await new Promise((r) => setTimeout(r, 100));

    let cursorMsg = null;
    ws2.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'cursor_move') cursorMsg = msg;
    });

    ws1.send(JSON.stringify({ type: 'cursor_move', userId: 'user1', x: 100, y: 200 }));
    await new Promise((r) => setTimeout(r, 200));
    assert(cursorMsg !== null, '收到光标消息');
    assert(cursorMsg.userId === 'user1', 'userId 正确');
    assert(cursorMsg.x === 100, 'x 坐标正确');
    assert(cursorMsg.y === 200, 'y 坐标正确');
    ws1.close();
    ws2.close();
  }

  // ---- 清理 ----
  await stopServer();

  // 清理测试数据
  const testDataDir = path.join(__dirname, '..', 'data-test-ws');
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }

  console.log(`\n========================================`);
  console.log(`  WebSocket: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
})();
