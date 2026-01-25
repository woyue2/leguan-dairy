# 智能日记本 - 私有部署指南

## 概述

本项目是一个纯静态的智能日记本应用，支持：
- 情绪分析（AI 检测负面内容并提供积极改写）
- 结构化分析（日志结构优化）
- 周记生成（多日记整合）
- 外部图片插入

部署到私有服务器后，数据存储在浏览器的 localStorage 中。

## 服务器要求

| 配置 | 要求 |
|------|------|
| CPU | 1 核 |
| 内存 | 1G |
| 带宽 | 1Mbps 以上 |
| 系统 | Ubuntu/Debian/CentOS |

## 部署步骤

### 1. 连接服务器

```bash
ssh root@你的服务器IP
```

### 2. 安装 Nginx

**Ubuntu/Debian:**
```bash
apt update
apt install nginx -y
```

**CentOS:**
```bash
yum install nginx -y
```

### 3. 上传代码

**方式 A：SCP 上传（本地执行）**

```bash
scp -r /path/to/your/diary-app/* root@你的服务器IP:/var/www/diary/
```

**方式 B：Git 克隆**

```bash
# 在服务器上
git clone 你的仓库地址 /var/www/diary/
```

### 4. 配置 Nginx

```bash
nano /etc/nginx/sites-available/diary
```

写入以下配置：

```nginx
server {
    listen 3000;
    server_name _;

    root /var/www/diary;
    index index.html;

    # 缓存静态文件
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|json)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/diary /etc/nginx/sites-enabled/
nginx -t  # 测试配置
systemctl restart nginx
```

### 5. 开放防火墙端口

```bash
# Ubuntu/Debian (ufw)
ufw allow 3000
ufw reload

# CentOS (firewalld)
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload
```

### 6. 访问测试

打开浏览器访问：`http://你的服务器IP:3000`

---

## 端口说明

| 端口 | 描述 |
|------|------|
| 3000 | 本项目使用的端口 |

如需修改端口，编辑 `/etc/nginx/sites-available/diary` 文件。

---

## 数据备份

数据存储在用户浏览器的 localStorage 中。

### 手动导出

在应用内点击"导出数据"按钮，下载 JSON 文件。

### 自动备份脚本

创建备份脚本：

```bash
nano /root/backup-diary.sh
```

写入：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
mkdir -p /root/diary-backup
cp /var/www/diary/js/storage.js /root/diary-backup/storage-$DATE.js 2>/dev/null || true
echo "备份完成: /root/diary-backup/"
ls /root/diary-backup/
```

添加执行权限：

```bash
chmod +x /root/backup-diary.sh
```

设置定时任务（每天凌晨 3 点备份）：

```bash
crontab -e
# 添加
0 3 * * * /root/backup-diary.sh
```

---

## 常见问题

### Q: 页面无法访问？
A: 检查防火墙是否开放 3000 端口，检查 Nginx 是否运行。

```bash
systemctl status nginx
```

### Q: Nginx 启动失败？
A: 检查配置语法：

```bash
nginx -t
```

### Q: 如何停止服务？
A:

```bash
systemctl stop nginx
```

### Q: 如何更新版本？
A: 重新上传代码后重启 Nginx：

```bash
systemctl restart nginx
```

---

## 费用估算

| 项目 | 费用 |
|------|------|
| 1核1G 云服务器 | 约 20-50 元/月 |
| 域名（可选） | 约 5-20 元/年 |

---

## 域名绑定（可选）

如果有域名，添加 A 记录：

1. 登录域名服务商后台
2. 添加 A 记录：
   - 记录类型: A
   - 主机名: @ 或 www
   - 值: 你的服务器IP
3. 等待 DNS 生效（几分钟到几小时）

访问方式：`http://你的域名:3000`

如需隐藏端口，使用反向代理：

```nginx
server {
    listen 80;
    server_name 你的域名;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 目录结构

部署后的目录结构：

```
/var/www/diary/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── storage.js
│   ├── offline.js
│   └── ui.js
├── config/
│   └── env.js
└── manifest.json
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML5 + CSS3 + ES6+ |
| Web 服务器 | Nginx |
| 存储 | 浏览器 localStorage |

---

## 联系

如有问题，请在 GitHub 提交 Issue。
