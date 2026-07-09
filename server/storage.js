// CanvasStorm — JSON 文件存储模块
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

// 确保数据目录存在
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取所有会话列表（仅 id、name、createdAt）
function listSessions() {
  ensureDir();
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const sessions = [];
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
      const s = JSON.parse(raw);
      sessions.push({ id: s.id, name: s.name, createdAt: s.createdAt });
    } catch (e) {
      // 跳过损坏文件
    }
  }
  // 按创建时间降序
  sessions.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return sessions;
}

// 读取单个会话完整数据
function getSession(id) {
  ensureDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf-8');
  return JSON.parse(raw);
}

// 保存会话（创建或更新）
function saveSession(session) {
  ensureDir();
  const file = path.join(DATA_DIR, `${session.id}.json`);
  fs.writeFileSync(file, JSON.stringify(session, null, 2), 'utf-8');
  return session;
}

// 删除会话
function deleteSession(id) {
  ensureDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    return true;
  }
  return false;
}

function userProjectFile(user) {
  ensureDir();
  const safe = encodeURIComponent(String(user || 'default'));
  const dir = path.join(DATA_DIR, 'users');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, `${safe}.projects.json`);
}

function getUserProjects(user) {
  const file = userProjectFile(user);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.projects) ? parsed.projects : [];
}

function saveUserProjects(user, projects) {
  const file = userProjectFile(user);
  const payload = {
    user: String(user || 'default'),
    projects: Array.isArray(projects) ? projects : [],
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2), 'utf-8');
  return payload.projects;
}

module.exports = {
  listSessions,
  getSession,
  saveSession,
  deleteSession,
  getUserProjects,
  saveUserProjects,
};
