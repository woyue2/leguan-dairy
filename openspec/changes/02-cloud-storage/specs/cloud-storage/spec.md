## ADDED Requirements
### Requirement: 用户数据存储
系统 SHALL 使用 Cloudflare R2 存储用户数据。

#### Scenario: 存储结构
- **WHEN** 用户注册成功
- **THEN** 在 R2 创建目录结构

#### Scenario: 读取用户数据
- **WHEN** 需要读取用户数据
- **THEN** 从 R2 读取 JSON 文件
- **AND** 返回解析后的对象

#### Scenario: 写入用户数据
- **WHEN** 需要保存用户数据
- **THEN** 写入 JSON 文件到 R2
- **AND** 保持原子性

### Requirement: 文件操作
系统 SHALL 提供 R2 文件的读写能力。

#### Scenario: 读取文件
- **WHEN** 读取用户文件
- **THEN** 返回文件内容（UTF-8）
- **WHEN** 文件不存在
- **THEN** 返回空对象

#### Scenario: 写入文件
- **WHEN** 保存用户数据
- **THEN** 先写临时文件
- **AND** 验证后重命名

### Requirement: 数据格式
系统 SHALL 使用 JSON 格式存储数据。

#### Scenario: 用户配置格式
```json
{
  "username": "用户名",
  "passwordHash": "密码哈希",
  "createdAt": "时间戳"
}
```

#### Scenario: 日记数据格式
```json
{
  "version": "1.0",
  "lastSync": "时间戳",
  "diaries": []
}
```

## 数据结构

```typescript
interface UserConfig {
  username: string;
  passwordHash: string;
  createdAt: string;
}

interface DiariesData {
  version: string;
  lastSync: string;
  diaries: Diary[];
}
```

## 依赖关系

- 前置：01-user-auth
