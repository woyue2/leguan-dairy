# 📊 服务器端存储方案 - 部署指南

## 🎯 核心改进

### ❌ 之前的问题
```
File System API 方案：
- 数据保存在用户本地电脑
- 换设备 = 数据丢失
- 无法集中管理
- 不适合部署场景
```

### ✅ 现在的方案
```
服务器端存储：
- 数据保存在 Docker 容器中
- 任何设备访问都看到相同数据
- Docker Volume 持久化
- 统一管理，自动备份
```

## 🏗️ 架构说明

```
┌─────────────────────────────────────────────────────────┐
│  浏览器（任何设备）                                       │
│                                                         │
│  http://172.245.142.4:3000                             │
│         ↓                                               │
│    访问应用                                              │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│  Docker 容器 (服务器)                                    │
│                                                         │
│  ┌──────────────────────────────────────┐              │
│  │  Nginx (前端静态文件)                 │              │
│  │  - HTML, CSS, JS                     │              │
│  └──────────────────────────────────────┘              │
│                    ↓ API 请求                          │
│  ┌──────────────────────────────────────┐              │
│  │  Node.js Express (后端 API)          │              │
│  │  - GET /api/diaries                  │              │
│  │  - POST /api/diaries                 │              │
│  │  - GET /api/weeklies                 │              │
│  │  - POST /api/weeklies                │              │
│  └──────────────────────────────────────┘              │
│                    ↓                                   │
│  ┌──────────────────────────────────────┐              │
│  │  Docker Volume: diary-data            │              │
│  │  - /data/diary/diary.json             │              │
│  │  - /data/diary/weekly.json            │              │
│  └──────────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📁 数据存储位置

### 在服务器上

```bash
# Docker Volume 位置
/var/lib/docker/volumes/diary-data/_data/

# 数据文件
/var/lib/docker/volumes/diary-data/_data/diary.json
/var/lib/docker/volumes/diary-data/_data/weekly.json
```

### 访问数据

```bash
# 方式1: 进入容器查看
docker exec -it diary-app sh
cat /data/diary/diary.json

# 方式2: 直接查看 Volume
docker run --rm -v diary-data:/data alpine cat /data/diary.json

# 方式3: 在宿主机查看
sudo cat /var/lib/docker/volumes/diary-data/_data/diary.json
```

## 🚀 部署步骤

### 方式1: 使用 Docker Compose（推荐）

```bash
cd /home/aa/Park/diary-app

# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps
```

### 方式2: 使用 Docker 命令

```bash
cd /home/aa/Park/diary-app

# 构建镜像
docker build -t diary-app:latest .

# 创建并运行容器
docker run -d \
  --name diary-app \
  -p 3000:3000 \
  -v diary-data:/data/diary \
  --restart unless-stopped \
  diary-app:latest

# 查看日志
docker logs -f diary-app

# 查看状态
docker ps | grep diary-app
```

### 方式3: 部署到远程服务器

#### 本地（WSL）

```bash
cd /home/aa/Park/diary-app

# 构建镜像
docker build -t diary-app:latest .

# 导出镜像
docker save diary-app:latest > diary-app.tar

# 上传到服务器
scp diary-app.tar root@172.245.142.4:/root/
```

#### 服务器上

```bash
ssh root@172.245.142.4

# 加载镜像
docker load < diary-app.tar

# 停止旧容器
docker stop diary-app 2>/dev/null || true
docker rm diary-app 2>/dev/null || true

# 运行新容器
docker run -d \
  --name diary-app \
  -p 3000:3000 \
  -v diary-data:/data/diary \
  --restart unless-stopped \
  diary-app:latest

# 验证
docker ps | grep diary-app
curl http://localhost:3000/api/health
```

## ✅ 验证部署

### 1. 检查服务状态

```bash
# 检查容器运行状态
docker ps | grep diary-app

# 查看日志
docker logs -f diary-app

# 健康检查
curl http://172.245.142.4:3000/api/health
```

**预期输出**:
```json
{
  "status": "ok",
  "dataDir": "/data/diary",
  "diariesCount": 0,
  "weekliesCount": 0
}
```

### 2. 测试应用

1. 打开浏览器: http://172.245.142.4:3000
2. Header 应显示: `服务器存储`
3. 写一篇日记
4. 保存
5. 刷新页面 - 数据应该还在

### 3. 验证数据持久化

```bash
# 查看数据文件
docker exec diary-app cat /data/diary/diary.json

# 重启容器
docker restart diary-app

# 等待几秒后再次查看 - 数据应该还在
docker exec diary-app cat /data/diary/diary.json
```

## 💾 数据备份

### 自动备份脚本

在服务器上创建备份脚本：

```bash
# SSH 到服务器
ssh root@172.245.142.4

# 创建备份脚本
cat > /root/backup-diary.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/diary-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# 备份 Docker Volume
docker run --rm \
  -v diary-data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine \
  tar czf /backup/diary-$TIMESTAMP.tar.gz -C /data .

echo "✅ 备份完成: diary-$TIMESTAMP.tar.gz"

# 保留最近 30 天的备份
find "$BACKUP_DIR" -name "diary-*.tar.gz" -mtime +30 -delete
EOF

chmod +x /root/backup-diary.sh
```

### 手动备份

```bash
# 即时备份
/root/backup-diary.sh

# 设置定时任务（每天凌晨 2 点备份）
crontab -e

# 添加以下行
0 2 * * * /root/backup-diary.sh >> /var/log/diary-backup.log 2>&1
```

### 恢复备份

```bash
# 列出备份文件
ls -lh /root/diary-backups/

# 恢复指定备份
docker run --rm \
  -v diary-data:/data \
  -v /root/diary-backups:/backup \
  alpine \
  tar xzf /backup/diary-20260206_020000.tar.gz -C /data
```

## 🔄 更新流程

### 本地

```bash
cd /home/aa/Park/diary-app

# 重新构建
docker build -t diary-app:latest .

# 导出
docker save diary-app:latest > diary-app.tar

# 上传
scp diary-app.tar root@172.245.142.4:/root/
```

### 服务器

```bash
ssh root@172.245.142.4

# 加载新镜像
docker load < diary-app.tar

# 停止并删除旧容器
docker stop diary-app
docker rm diary-app

# 运行新容器（数据会保留在 Docker Volume 中）
docker run -d \
  --name diary-app \
  -p 3000:3000 \
  -v diary-data:/data/diary \
  --restart unless-stopped \
  diary-app:latest

# 验证
docker ps | grep diary-app
```

## 📊 监控

### 查看数据统计

```bash
# API 调用
curl http://172.245.142.4:3000/api/health | jq
```

### 查看容器资源使用

```bash
docker stats diary-app
```

### 查看日志

```bash
# 实时日志
docker logs -f diary-app

# 最近 100 行
docker logs --tail 100 diary-app
```

## 🛠️ 故障排查

### 问题1: 容器无法启动

```bash
# 查看日志
docker logs diary-app

# 检查端口占用
netstat -tlnp | grep 3000

# 检查 Volume
docker volume ls | grep diary
docker volume inspect diary-data
```

### 问题2: 数据丢失

```bash
# 检查 Volume
docker volume ls

# 查看 Volume 数据
docker run --rm -v diary-data:/data alpine ls -la /data

# 从备份恢复
# （参考上面的恢复备份步骤）
```

### 问题3: API 不响应

```bash
# 检查容器状态
docker ps | grep diary-app

# 检查后端进程
docker exec diary-app ps aux | grep node

# 重启容器
docker restart diary-app
```

## 🔒 安全建议

1. **限制访问**
   ```bash
   # 使用防火墙限制访问
   iptables -A INPUT -p tcp --dport 3000 -s 允许的IP -j ACCEPT
   iptables -A INPUT -p tcp --dport 3000 -j DROP
   ```

2. **HTTPS 访问**（可选）
   ```bash
   # 使用 Nginx 反向代理 + SSL
   # 参考标准部署流程
   ```

3. **定期备份**
   ```bash
   # 设置自动备份
   # （参考上面的备份脚本）
   ```

## 📈 优势总结

### ✅ 相比 File System API

| 特性 | File System API | 服务器存储 |
|------|----------------|-----------|
| 数据位置 | 客户端 | 服务器容器 |
| 多设备 | ❌ 不支持 | ✅ 支持 |
| 数据管理 | 分散 | 集中 |
| 备份 | 手动 | 自动 |
| 部署 | 不适合 | 完美 |

### ✅ 适合场景

- ✅ 多人使用同一个应用
- ✅ 多设备访问
- ✅ 需要集中管理
- ✅ 需要自动备份
- ✅ 部署在服务器

## 📝 总结

现在数据保存在服务器的 Docker Volume 中：
- **位置**: `/var/lib/docker/volumes/diary-data/_data/`
- **文件**: `diary.json`, `weekly.json`
- **持久化**: Docker Volume 自动管理
- **备份**: 可以用脚本定期备份

从任何设备访问 http://172.245.142.4:3000 都能看到相同的数据！

🎉 完成！
