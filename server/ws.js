// CanvasStorm — WebSocket 协作通道
const WebSocket = require('ws');
const storage = require('./storage');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  const rooms = new Map(); // sessionId → Set<ws>

  wss.on('connection', (ws) => {
    let clientRoom = null;

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        switch (msg.type) {
          case 'join': {
            if (clientRoom && rooms.has(clientRoom)) {
              rooms.get(clientRoom).delete(ws);
            }
            clientRoom = msg.sessionId;
            if (!rooms.has(clientRoom)) {
              rooms.set(clientRoom, new Set());
            }
            rooms.get(clientRoom).add(ws);
            break;
          }
          case 'session_update': {
            broadcast(clientRoom, { type: 'session_update', sessionId: msg.sessionId }, ws);
            break;
          }
          case 'cursor_move': {
            broadcast(clientRoom, { type: 'cursor_move', userId: msg.userId, x: msg.x, y: msg.y }, ws);
            break;
          }
        }
      } catch (_) {
        // 忽略无效消息
      }
    });

    ws.on('close', () => {
      if (clientRoom && rooms.has(clientRoom)) {
        rooms.get(clientRoom).delete(ws);
        if (rooms.get(clientRoom).size === 0) rooms.delete(clientRoom);
      }
    });

    ws.on('error', () => {});
  });

  function broadcast(room, message, excludeWs) {
    if (!room || !rooms.has(room)) return;
    const data = JSON.stringify(message);
    for (const client of rooms.get(room)) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  console.log('[WS] WebSocket 通道已就绪');
  return wss;
}

module.exports = setupWebSocket;
