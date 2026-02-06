FROM node:18-alpine

# 安装 nginx
RUN apk add --no-cache nginx

# 设置工作目录
WORKDIR /app

# 复制后端文件
COPY server.js package.json ./

# 安装依赖
RUN npm install --production

# 创建数据目录
RUN mkdir -p /data/diary

# 复制前端文件
COPY . /usr/share/nginx/html/

# 复制自定义 nginx 配置（替换主配置）
COPY nginx-server.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 3000

# 启动（直接在 CMD 中启动）
CMD sh -c "node /app/server.js & nginx -g 'daemon off;'"
