#!/bin/bash

echo "🚀 启动日记应用开发服务器..."
echo ""
echo "======================================"
echo "  智能日记本 - 开发模式"
echo "======================================"
echo ""
echo "📍 应用地址: http://localhost:8888"
echo "📍 测试页面: http://localhost:8888/test-storage.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 检查 Python 版本
if command -v python3 &> /dev/null; then
    python3 -m http.server 8888 --bind 127.0.0.1
elif command -v python &> /dev/null; then
    python -m http.server 8888 --bind 127.0.0.1
else
    echo "❌ 错误: 未找到 Python"
    echo "请安装 Python 3"
    exit 1
fi
