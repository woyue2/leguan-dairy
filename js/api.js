class ZhipuAPI {
  constructor() {
    this.config = Config.api
    this.controller = null
  }

  getHeaders() {
    const apiKey = Config.getApiKey()
    if (!apiKey) {
      throw new Error('API Key未设置')
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  }

  async analyze(content, retryCount = 0) {
    const cleanedContent = this.stripImageLines(content || '')
    if (!cleanedContent || cleanedContent.trim().length < Config.validation.minContentLength) {
      throw new Error('内容太短，无法分析')
    }

    if (!Config.hasApiKey()) {
      throw new Error('请先设置智谱AI API Key')
    }

    if (!navigator.onLine) {
      throw new Error('网络连接已断开')
    }

    this.controller = new AbortController()
    const timeoutId = setTimeout(() => this.controller.abort(), this.config.timeout)

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: Config.getDefaultSystemPrompt()
            },
            {
              role: 'user',
              content: cleanedContent
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
        signal: this.controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000
          console.log(`请求频率限制，等待${delay/1000}秒后重试...`)
          await this.delay(delay)
          return this.analyze(cleanedContent, retryCount + 1)
        }

        throw this.handleErrorResponse(response.status, errorData)
      }

      const data = await response.json()
      return this.parseResponse(data)

    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error('请求超时，请重试')
      }

      throw error
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  handleErrorResponse(status, errorData) {
    const errorMessages = {
      401: 'API Key无效，请检查配置',
      403: '没有访问权限，请检查API Key权限',
      429: '请求频率过高，请稍后再试',
      500: '服务器错误，请重试',
      503: '服务暂时不可用，请稍后再试'
    }

    const message = errorMessages[status] ||
      errorData.error?.message ||
      `请求失败 (${status})`

    return new Error(message)
  }

  parseResponse(data) {
    try {
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('API返回数据格式错误')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        console.warn('无法解析JSON，尝试手动解析:', content)
        return this.fallbackParse(content)
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        title: parsed.title || '',
        sentences: parsed.sentences || [],
        analysis: parsed.analysis || [],
        rewritten_version: parsed.rewritten_version || '',
        raw_response: content
      }

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('解析响应失败:', error)
      throw new Error('解析分析结果失败')
    }
  }

  fallbackParse(content) {
    return {
      sentences: content.split(/[。！？\n]/).filter(s => s.trim()),
      analysis: [],
      rewritten_version: content,
      raw_response: content,
      parse_warning: '自动解析结果，可能不准确'
    }
  }

  async validateApiKey() {
    if (!Config.hasApiKey()) {
      return { valid: false, error: 'API Key未设置' }
    }

    try {
      this.controller = new AbortController()
      const timeoutId = setTimeout(() => this.controller.abort(), 10000)

      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 10
        }),
        signal: this.controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { valid: true }
      } else {
        const errorData = await response.json().catch(() => ({}))
        return { valid: false, error: errorData.error?.message || 'API Key无效' }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { valid: false, error: '验证超时' }
      }
      return { valid: false, error: '网络错误' }
    }
  }

  abort() {
    if (this.controller) {
      this.controller.abort()
    }
  }

  stripImageLines(content) {
    return content
      .split('\n')
      .filter(line => !line.trim().startsWith('img:'))
      .join('\n')
      .trim()
  }
}

class APIError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message)
    this.name = 'APIError'
    this.code = code
  }

  static network() {
    return new APIError('网络连接失败，请检查网络', 'NETWORK')
  }

  static timeout() {
    return new APIError('请求超时，请重试', 'TIMEOUT')
  }

  static invalidKey() {
    return new APIError('API Key无效', 'INVALID_KEY')
  }

  static quotaExceeded() {
    return new APIError('API调用次数已用尽', 'QUOTA_EXCEEDED')
  }

  // ========== 周记生成方法 ==========

  async generateWeeklySummary(diaries, onProgress) {
    if (!diaries || diaries.length === 0) {
      throw new Error('本周没有日记，无法生成周记')
    }

    if (!Config.hasApiKey()) {
      throw new Error('请先设置智谱AI API Key')
    }

    if (!navigator.onLine) {
      throw new Error('网络连接已断开')
    }

    this.controller = new AbortController()

    if (onProgress) {
      onProgress(10, '整理本周日记...', '正在收集日记内容')
    }

    const diaryContent = diaries
      .map(diary => {
        const date = new Date(diary.date).toLocaleDateString('zh-CN', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
        const content = diary.finalVersion || diary.content
        const cleaned = this.stripImageLines(content || '')
        return `【${date}】${diary.title}\n${cleaned}`
      })
      .join('\n\n')

    if (onProgress) {
      onProgress(30, '生成周记中...', '正在调用AI')
    }

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `你是一个温暖的故事作家。

任务：把用户的周记整理成一个连贯、温暖的故事。

要求：
1. 保持原文的核心内容和细节，不要过度概括
2. 在每天的事件中寻找联系，用故事线串联
3. 用积极温暖的语言，让读者感到治愈
4. 生成一个诗意的标题（4-8个字）
5. 故事要有开头、发展、结尾的结构
6. 适当加入情感描写，但保持真实

请用JSON格式返回：
{
  "title": "诗意标题（4-8个字）",
  "summary": "完整的周记故事"
}

注意：
- 如果某天没有日记，可以跳过或简单提及
- 保持故事连贯性，不要像流水账
- 让读者感受到这一周的美好`
            },
            {
              role: 'user',
              content: `请根据以下本周日记生成一篇周记：\n\n${diaryContent}`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        }),
        signal: this.controller.signal
      })

      if (onProgress) {
        onProgress(60, '解析周记内容...', '正在处理结果')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw this.handleErrorResponse(response.status, errorData)
      }

      const data = await response.json()

      if (onProgress) {
        onProgress(90, '完成生成...', '准备显示')
      }

      const result = this.parseWeeklyResponse(data)

      if (onProgress) {
        onProgress(100, '生成完成', '周记已准备就绪')
      }

      return result

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求已取消')
      }
      throw error
    }
  }

  parseWeeklyResponse(data) {
    try {
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('API返回数据格式错误')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        console.warn('周记JSON解析失败，尝试手动解析:', content)
        return {
          title: '本周记录',
          summary: content
        }
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        title: parsed.title || '本周记录',
        summary: parsed.summary || content
      }

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      console.error('解析周记响应失败:', error)
      throw new Error('解析周记结果失败')
    }
  }

}
