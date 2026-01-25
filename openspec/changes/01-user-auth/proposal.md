# 变更：用户认证系统

## 为什么
为云端版智能日记本提供用户系统基础，实现注册、登录、修改密码功能。

## 什么会改变
- 新增用户注册接口
- 新增用户登录接口（返回 JWT Token）
- 新增修改密码接口
- 新增 Token 验证中间件

## 影响
- 新增文件：`worker/src/auth.js`、`worker/src/middleware/auth.js`
- 无现有文件修改

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |
| POST | /auth/refresh | 刷新 Token |
| PUT | /auth/password | 修改密码 |

## 技术细节

- **用户名**：3-20位，支持中文、英文、数字
- **密码**：8位以上，必须包含字母和数字
- **Token**：JWT，有效期 7 天
- **密码存储**：DJB2 哈希 + 用户名作为 salt
