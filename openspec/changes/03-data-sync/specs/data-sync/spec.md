## ADDED Requirements
### Requirement: 首次登录数据处理
系统 SHALL 处理用户首次登录时的数据初始化。

#### Scenario: 云端已有数据
- **WHEN** 首次登录且云端有数据
- **THEN** 加载云端数据

#### Scenario: 导入本地数据
- **WHEN** 首次登录且本地有数据、云端无数据
- **THEN** 提示"是否导入本地数据？"
- **WHEN** 用户确认
- **THEN** 导入本地数据到云端

#### Scenario: 双方都无数据
- **WHEN** 首次登录且双方都无数据
- **THEN** 创建空数据结构

### Requirement: 数据导出
系统 SHALL 支持导出数据到本地。

#### Scenario: 导出为 JSON
- **WHEN** 用户点击导出
- **THEN** 读取云端数据
- **AND** 触发浏览器下载
- **AND** 文件名：`diary-backup-{username}-{date}.json`

### Requirement: 自动同步
系统 SHALL 保持云端和本地数据同步。

#### Scenario: 自动上传
- **WHEN** 本地有修改
- **THEN** 自动上传到云端

#### Scenario: 自动下载
- **WHEN** 云端有新数据
- **AND** 自动下载到本地

#### Scenario: 冲突解决
- **WHEN** 同一记录被双方修改
- **THEN** 以时间戳最新的为准

### Requirement: 离线支持
系统 SHALL 支持离线操作。

#### Scenario: 离线暂存
- **WHEN** 网络断开
- **THEN** 本地修改暂存到 localStorage

#### Scenario: 恢复同步
- **WHEN** 网络恢复
- **THEN** 自动同步暂存的数据

## 数据结构

```typescript
interface SyncStatus {
  state: 'synced' | 'syncing' | 'offline' | 'pending';
  lastSync: string | null;
}

interface SyncConflict {
  local: Diary;
  remote: Diary;
  resolved: Diary;
}
```

## 依赖关系

- 前置：02-cloud-storage
