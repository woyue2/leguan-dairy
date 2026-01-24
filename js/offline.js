class OfflineQueue {
  constructor() {
    this.storageKey = Config.storageKeys.offlineQueue
    this.maxSize = Config.validation.maxOfflineQueueSize
    this.isProcessing = false
    this.listeners = []
    this.init()
  }

  init() {
    this.setupNetworkListeners()
    this.syncFromStorage()
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.notifyListeners('online')
      this.processQueue()
    })

    window.addEventListener('offline', () => {
      this.notifyListeners('offline')
    })
  }

  add(item) {
    const queue = this.getQueue()

    if (queue.length >= this.maxSize) {
      console.warn('离线队列已满，移除最旧的项')
      queue.shift()
    }

    queue.push({
      ...item,
      addedAt: new Date().toISOString(),
      retryCount: 0
    })

    this.saveQueue(queue)
    this.notifyListeners('itemAdded', { item, queueSize: queue.length })

    return queue.length
  }

  remove(index) {
    const queue = this.getQueue()
    queue.splice(index, 1)
    this.saveQueue(queue)
    this.notifyListeners('itemRemoved', { index, queueSize: queue.length })
  }

  clear() {
    this.saveQueue([])
    this.notifyListeners('cleared')
  }

  async processQueue() {
    if (this.isProcessing || !navigator.onLine) {
      return
    }

    this.isProcessing = true
    const queue = this.getQueue()

    if (queue.length === 0) {
      this.isProcessing = false
      return
    }

    this.notifyListeners('processingStarted', { count: queue.length })

    while (queue.length > 0 && navigator.onLine) {
      const item = queue[0]

      try {
        await this.processItem(item)
        queue.shift()
        this.saveQueue(queue)
        this.notifyListeners('itemProcessed', { index: 0, remaining: queue.length })
      } catch (error) {
        console.error('处理队列项失败:', error)

        item.retryCount++
        if (item.retryCount >= 3) {
          queue.shift()
          this.notifyListeners('itemFailed', { item, error: error.message })
        } else {
          this.notifyListeners('itemRetried', { item, retryCount: item.retryCount })
        }

        this.saveQueue(queue)

        if (queue.length > 0) {
          await this.delay(5000)
        }
      }
    }

    this.isProcessing = false
    this.notifyListeners('processingCompleted')
  }

  async processItem(item) {
    if (!item || typeof item.execute !== 'function') {
      throw new Error('无效的队列项')
    }

    return await item.execute()
  }

  getQueue() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('读取队列失败:', e)
      return []
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue))
    } catch (e) {
      console.error('保存队列失败:', e)
      throw new Error('存储空间不足')
    }
  }

  syncFromStorage() {
    if (navigator.onLine) {
      this.processQueue()
    }
  }

  getSize() {
    return this.getQueue().length
  }

  isOnline() {
    return navigator.onLine
  }

  on(event, callback) {
    this.listeners.push({ event, callback })
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => l.event !== event || l.callback !== callback
    )
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => l.callback(data))

    if (event === 'processingCompleted' || event === 'processingStarted') {
      this.listeners
        .filter(l => l.event === 'queueChanged')
        .forEach(l => l.callback(data))
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  createAnalysisTask(content, diaryId) {
    return {
      type: 'analysis',
      content,
      diaryId,
      execute: async () => {
        const api = new ZhipuAPI()
        const result = await api.analyze(content)
        const storage = new DiaryStorage()
        storage.saveAnalysis(diaryId, result)
        return result
      }
    }
  }

  createRetryTask(originalTask) {
    return {
      ...originalTask,
      retryCount: 0,
      execute: async () => {
        return await this.processItem(originalTask)
      }
    }
  }
}
