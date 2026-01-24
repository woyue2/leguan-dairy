# 智能日记本

一个带有AI情感分析功能的日记应用，写完日记后自动检测负面内容并提供积极改写建议。

## 功能特点

- 沉浸式写作体验
- 智谱AI情感分析，自动识别负面情绪
- 负面句子局部高亮，悬停显示改写建议
- 一键采用积极改写版本
- 离线支持，网络断开时自动队列处理
- 数据本地存储，保护隐私
- 支持数据导出导入备份

## 快速开始

### 1. 获取智谱AI API Key

1. 访问 [智谱AI开放平台](https://www.bigmodel.cn/)
2. 注册账号并完成实名认证
3. 创建API Key
4. 复制API Key备用

### 2. 配置API Key

首次打开应用会提示设置API Key，或点击右上角"设置"按钮输入。

### 3. 开始使用

1. 点击"写新日记"开始写作
2. 写完后点击"保存并分析"
3. 查看分析结果：
   - 红色高亮：负面句子（悬停查看改写建议）
   - 绿色区域：AI生成的积极改写版本
4. 选择"保留原文"或"采用改写"

## 本地开发

```bash
# 直接用浏览器打开
open index.html

# 或使用简单HTTP服务器
npx serve .
```

## 部署

### 方案1：GitHub Pages（免费）

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create diary-app --public --source=. --push
# 在仓库设置中启用GitHub Pages
```

### 方案2：Vercel（免费）

```bash
npm i -g vercel
vercel --prod
```

### 方案3：自建服务器（1核1G足够）

#### 使用Nginx

```bash
# 安装Nginx
sudo apt install nginx

# 配置文件 /etc/nginx/sites-available/diary-app
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/diary-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/diary-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 使用Node.js服务

```bash
# 安装http-server
npm i -g http-server

# 后台运行
http-server -p 80 -c-1 .
```

## 技术栈

- 纯原生 HTML5 + CSS3 + ES6+
- localStorage 本地存储
- 智谱AI ChatGLM-4 API
- 无需后端，纯静态部署

## 文件结构

```
diary-app/
├── index.html          # 主页面
├── manifest.json       # PWA配置
├── css/
│   └── style.css       # 样式
├── js/
│   ├── app.js          # 主入口
│   ├── api.js          # API调用
│   ├── storage.js      # 数据存储
│   ├── offline.js      # 离线队列
│   └── ui.js           # UI组件
└── config/
    └── env.js          # 配置
```

## 隐私说明

- 所有日记内容存储在浏览器本地
- API调用时内容会发送到智谱AI服务器进行分析
- 分析完成后可选择删除敏感内容
- 建议定期导出备份数据

## 许可证

MIT License
