class DiaryStorage {
  constructor() {
    this.storageKey = Config.storageKeys.diaries
    this.init()
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('读取日记失败:', e)
      return []
    }
  }

  getById(id) {
    const diaries = this.getAll()
    return diaries.find(d => d.id === id) || null
  }

  getByDate(dateStr) {
    const diaries = this.getAll()
    return diaries.filter(d => d.date === dateStr)
  }

  create(diary) {
    const diaries = this.getAll()
    const newDiary = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: diary.content || '',
      title: diary.title || this.extractTitle(diary.content),
      date: diary.date || new Date().toISOString().split('T')[0],
      analysis: diary.analysis || null,
      finalVersion: diary.finalVersion || diary.content,
      isAnalyzed: diary.isAnalyzed || false
    }

    diaries.unshift(newDiary)
    this.saveAll(diaries)
    return newDiary
  }

  update(id, updates) {
    const diaries = this.getAll()
    const index = diaries.findIndex(d => d.id === id)

    if (index === -1) {
      throw new Error('日记不存在')
    }

    diaries[index] = {
      ...diaries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveAll(diaries)
    return diaries[index]
  }

  delete(id) {
    const diaries = this.getAll()
    const filtered = diaries.filter(d => d.id !== id)
    this.saveAll(filtered)
  }

  saveAnalysis(id, analysisData) {
    const diary = this.getById(id)
    if (!diary) {
      throw new Error('日记不存在')
    }

    const result = this.update(id, {
      analysis: analysisData,
      title: analysisData.title || undefined,
      isAnalyzed: true
    })
    return result
  }

  saveFinalVersion(id, finalVersion) {
    return this.update(id, { finalVersion })
  }

  saveAll(diaries) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(diaries))
    } catch (e) {
      console.error('保存日记失败:', e)
      throw new Error('存储空间不足，无法保存')
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  extractTitle(content) {
    if (!content) return '无标题'
    const firstLine = content.split('\n')[0].trim()
    return firstLine.length > 30
      ? firstLine.substring(0, 30) + '...'
      : firstLine || '无标题'
  }

  search(keyword) {
    const diaries = this.getAll()
    if (!keyword) return diaries

    const lowerKeyword = keyword.toLowerCase()
    return diaries.filter(d =>
      d.content.toLowerCase().includes(lowerKeyword) ||
      d.title.toLowerCase().includes(lowerKeyword)
    )
  }

  getStats() {
    const diaries = this.getAll()
    const today = new Date().toISOString().split('T')[0]

    return {
      total: diaries.length,
      today: diaries.filter(d => d.date === today).length,
      analyzed: diaries.filter(d => d.isAnalyzed).length
    }
  }

  clearAll() {
    if (confirm('确定要删除所有日记吗？此操作不可恢复。')) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }
  }

  export() {
    return JSON.stringify(this.getAll(), null, 2)
  }

  import(jsonData) {
    try {
      const diaries = JSON.parse(jsonData)
      if (!Array.isArray(diaries)) {
        throw new Error('数据格式错误')
      }

      const existing = this.getAll()
      const merged = [...diaries, ...existing]
      const unique = merged.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id)
        if (!x) {
          return acc.concat([current])
        }
        return acc
      }, [])

      this.saveAll(unique)
      return unique.length - existing.length
    } catch (e) {
      throw new Error('导入失败: ' + e.message)
    }
  }
}
