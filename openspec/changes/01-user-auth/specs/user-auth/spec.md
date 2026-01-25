## ADDED Requirements
### Requirement: 用户注册
系统 SHALL 支持用户注册新账号。

#### Scenario: 注册成功
- **WHEN** 用户输入用户名（3-20位，支持中文）、密码（8位+字母+数字）
- **AND** 点击注册按钮
- **THEN** 验证输入格式
- **AND** 检查用户名是否已存在
- **AND** 创建用户配置
- **AND** 返回成功

#### Scenario: 用户名已存在
- **WHEN** 用户名已被注册
- **THEN** 返回错误"用户名已被占用"

#### Scenario: 密码格式错误
- **WHEN** 密码不符合要求
- **THEN** 返回错误并提示要求

### Requirement: 用户登录
系统 SHALL 支持用户登录。

#### Scenario: 登录成功
- **WHEN** 用户输入正确的用户名和密码
- **THEN** 验证密码匹配
- **AND** 生成 JWT Token（有效期 7 天）
- **AND** 返回 Token 和用户信息

#### Scenario: 登录失败
- **WHEN** 用户名不存在或密码错误
- **THEN** 返回对应错误提示

### Requirement: Token 验证
系统 SHALL 验证请求的 Token 有效性。

#### Scenario: Token 有效
- **WHEN** 请求携带有效 Token
- **THEN** 验证签名，提取用户名
- **AND** 允许访问受保护资源

#### Scenario: Token 无效或过期
- **WHEN** Token 已过期或格式错误
- **THEN** 返回 401 错误

### Requirement: 修改密码
系统 SHALL 支持用户修改密码。

#### Scenario: 修改密码成功
- **WHEN** 用户已登录，输入正确旧密码和新密码
- **THEN** 更新密码哈希
- **AND** 返回成功

#### Scenario: 旧密码错误
- **WHEN** 旧密码不正确
- **THEN** 返回错误，不修改密码

## 数据结构

```typescript
interface RegisterRequest {
  username: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: true;
  token: string;
  user: { username: string };
}
```

## 依赖关系

- 无（基础认证模块）
