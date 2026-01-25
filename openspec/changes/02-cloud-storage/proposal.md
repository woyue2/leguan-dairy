# 变更：云端存储配置

## 为什么
为用户数据提供云端存储，支持"一人一个 JSON 文件"的数据模型。

## 什么会改变
- 配置 Cloudflare R2 存储桶
- 实现 R2 文件读写封装
- 用户数据存储为 JSON 文件

## 影响
- 新增文件：`worker/src/storage.js`、`worker/wrangler.toml`
- 无现有文件修改

## 存储结构

```
R2 Storage:
users/
└── {username}/
    ├── config.json          # 用户配置（密码等）
    └── data/
        └── diaries.json     # 日记数据
```

## 技术细节

- **存储服务**：Cloudflare R2
- **数据格式**：JSON
- **免费额度**：10GB 存储 + 100GB 读取
- **单文件限制**：10MB
