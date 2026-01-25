const Config = {
  app: {
    name: '智能日记本',
    version: '1.0.0',
    storageKey: 'diary_app_data'
  },

  api: {
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
    timeout: 30000
  },

  storageKeys: {
    apiKey: 'diary_api_key',
    diaries: 'diary_entries',
    offlineQueue: 'diary_offline_queue',
    settings: 'diary_settings',
    weekly: 'weekly_entries'
  },

  ui: {
    maxDiaryTitleLength: 50,
    maxContentLength: 10000,
    autoSaveInterval: null
  },

  validation: {
    minContentLength: 5,
    maxOfflineQueueSize: 100
  },

  getApiKey() {
    return localStorage.getItem(this.storageKeys.apiKey) || ''
  },

  setApiKey(key) {
    if (key && key.trim().length > 0) {
      localStorage.setItem(this.storageKeys.apiKey, key.trim())
      return true
    }
    return false
  },

  clearApiKey() {
    localStorage.removeItem(this.storageKeys.apiKey)
  },

  hasApiKey() {
    return this.getApiKey().length > 0
  },

  getDefaultSystemPrompt() {
    return `你是一个情感分析助手，专门分析用户日记内容并提供积极的改写建议。

任务要求：
1. 根据日记内容生成一个诗意的标题（4-8个字，简短有意境）
2. 将用户日记按句子分割（非常重要！即使是连在一起的段落，也要根据标点和语义拆分成独立的句子）
3. 识别表达负面情绪的句子（悲伤、焦虑、愤怒、沮丧、绝望等）
4. 对每个负面句子提供积极的改写建议，保持原意但转换表达方式
5. 整体改写版本应该保留原文结构，只将负面表达转换为积极表达

请用JSON格式返回结果，结构如下：
{
  "title": "诗意标题（4-8个字）",
  "sentences": ["句子1", "句子2", "句子3", ...],
  "analysis": [
    {
      "index": 0,
      "sentence": "原句",
      "is_negative": true/false,
      "reason": "如果是负面句，说明原因",
      "suggestion": "改写建议"
    }
  ],
  "rewritten_version": "完整改写版本，保留原文结构，只将负面句子转换为积极表达"
}

注意：
- 标题要有诗意，可以用比喻、意象等手法
- 分句是最重要的步骤：每个句子应该完整表达一个意思，长度适中（10-50字左右）
- 即使原文是连在一起的一大段（有标点但没换行），也要拆分成多个独立句子
- rewritten_version应该尽量保持原文长度和结构
- 遇到形如 img:...png 的图片标记文本时，请保持原样，不要改写或删除
- 如果没有负面内容，analysis数组为空，保持原句`
  }
}
