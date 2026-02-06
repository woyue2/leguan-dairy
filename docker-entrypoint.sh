#!/bin/sh

# 启动 Node.js 后端服务器（后台）
node /app/server.js &

# 等待 Node.js 启动
sleep 2

# 启动 Nginx 前端服务器
nginx -g "daemon off;"
