#!/bin/bash
# CanvasStorm 一键启动（macOS）
set -e

cd "$(cd "$(dirname "$0")" && pwd)"

echo "=============================="
echo "  CanvasStorm 头脑风暴画布"
echo "=============================="

if ! command -v node &>/dev/null; then
  echo "❌ 未检测到 Node.js，请先安装: https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

echo "🚀 启动服务 → http://localhost:3000"
echo ""
open http://localhost:3000
node server/app.js
