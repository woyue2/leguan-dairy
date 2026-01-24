class UIManager {
  constructor() {
    this.currentDiaryId = null
    this.elements = {}
    this.init()
  }

  init() {
    this.cacheElements()
    this.bindEvents()
    this.checkApiKey()
    this.updateOnlineStatus()
  }

  cacheElements() {
    this.elements = {
      app: document.getElementById('app'),
      viewList: document.getElementById('view-list'),
      viewEditor: document.getElementById('view-editor'),
      viewSettings: document.getElementById('view-settings'),
      btnNew: document.getElementById('btn-new'),
      btnSettings: document.getElementById('btn-settings'),
      btnBack: document.getElementById('btn-back'),
      btnSave: document.getElementById('btn-save'),
      btnApiKey: document.getElementById('btn-api-key'),
      diaryList: document.getElementById('diary-list'),
      editorContent: document.getElementById('editor-content'),
      editorTitle: document.getElementById('editor-title'),
      statusOnline: document.getElementById('status-online'),
      statusQueue: document.getElementById('status-queue'),
      statusCount: document.getElementById('status-count'),
      modalAnalysis: document.getElementById('modal-analysis'),
      modalSettings: document.getElementById('modal-settings'),
      analysisContent: document.getElementById('analysis-content'),
      analysisRewritten: document.getElementById('analysis-rewritten'),
      settingsApiKey: document.getElementById('settings-api-key'),
      toast: document.getElementById('toast')
    }
  }

  bindEvents() {
    if (this.elements.btnNew) {
      this.elements.btnNew.addEventListener('click', () => this.showEditor())
    }
    if (this.elements.btnBack) {
      this.elements.btnBack.addEventListener('click', () => this.showList())
    }
    if (this.elements.btnSettings) {
      this.elements.btnSettings.addEventListener('click', () => this.showSettings())
    }
    if (this.elements.btnSave) {
      this.elements.btnSave.addEventListener('click', () => this.handleSave())
    }
    if (this.elements.btnApiKey) {
      this.elements.btnApiKey.addEventListener('click', () => this.saveApiKey())
    }
  }

  showView(viewName) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'))
    const view = document.getElementById(`view-${viewName}`)
    if (view) {
      view.classList.remove('hidden')
    }
  }

  showList() {
    this.currentDiaryId = null
    this.renderDiaryList()
    this.showView('list')
  }

  showEditor(diaryId = null) {
    if (diaryId) {
      const storage = new DiaryStorage()
      const diary = storage.getById(diaryId)
      if (diary) {
        this.elements.editorTitle.value = diary.title
        this.elements.editorContent.value = diary.finalVersion || diary.content
        this.currentDiaryId = diaryId
      }
    } else {
      this.elements.editorTitle.value = ''
      this.elements.editorContent.value = ''
      this.currentDiaryId = null
    }
    this.updateWordCount()
    this.bindWordCountEvent()
    this.showView('editor')
    this.elements.editorContent.focus()
  }

  showSettings() {
    this.elements.settingsApiKey.value = Config.getApiKey()
    this.showView('settings')
  }

  renderDiaryList() {
    const storage = new DiaryStorage()
    const diaries = storage.getAll()

    if (diaries.length === 0) {
      this.elements.diaryList.innerHTML = `
        <div class="empty-state">
          <p>还没有日记</p>
          <button class="btn-primary" onclick="ui.showEditor()">写第一篇日记</button>
        </div>
      `
      return
    }

    this.elements.diaryList.innerHTML = diaries.map(diary => `
      <div class="diary-card" data-id="${diary.id}">
        <div class="diary-card-header">
          <h3 class="diary-card-title">${this.escapeHtml(diary.title)}</h3>
          <span class="diary-card-date">${this.formatDate(diary.date)}</span>
        </div>
        <p class="diary-card-preview">${this.escapeHtml((diary.finalVersion || diary.content).substring(0, 100))}...</p>
        <div class="diary-card-footer">
          <span class="diary-card-status ${diary.isAnalyzed ? 'analyzed' : ''}">
            ${diary.isAnalyzed ? '已分析' : '未分析'}
          </span>
          <div class="diary-card-actions">
            <button class="btn-small" onclick="ui.showEditor('${diary.id}')">编辑</button>
            <button class="btn-small btn-danger" onclick="ui.deleteDiary('${diary.id}')">删除</button>
          </div>
        </div>
      </div>
    `).join('')
  }

  async handleSave() {
    const content = this.elements.editorContent.value.trim()
    const title = this.elements.editorTitle.value.trim() ||
      this.extractTitle(content)

    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    const storage = new DiaryStorage()
    let diary

    try {
      if (this.currentDiaryId) {
        diary = storage.update(this.currentDiaryId, { content, title })
      } else {
        diary = storage.create({ content, title })
        this.currentDiaryId = diary.id
      }

      this.showToast('保存成功')
      this.showAnalysisProgress()

      const offline = new OfflineQueue()
      if (!navigator.onLine) {
        this.hideAnalysisProgress()
        offline.add(offline.createAnalysisTask(content, diary.id))
        this.showToast('已加入离线队列，有网时自动分析')
        this.renderDiaryList()
        return
      }

      const api = new ZhipuAPI()

      try {
        const result = await api.analyze(content, (percent, status, info) => {
          this.updateProgress(percent, status, info)
        })
        this.hideAnalysisProgress()
        storage.saveAnalysis(diary.id, result)
        this.showAnalysisModal(diary.id, result)
        this.renderDiaryList()
      } catch (error) {
        this.hideAnalysisProgress()
        if (error.message.includes('请求频率')) {
          this.showToast(error.message)
        } else if (error.message.includes('网络') || error.message.includes('取消')) {
          const offline = new OfflineQueue()
          offline.add(offline.createAnalysisTask(content, diary?.id))
          this.showToast('网络问题，已加入离线队列')
        } else if (error.message.includes('超时')) {
          this.showToast('分析超时，请重试')
        } else {
          this.showToast(error.message)
        }
      }

    } catch (error) {
      this.hideAnalysisProgress()
      this.showToast(error.message)
    }
  }

  showAnalysisModal(diaryId, analysis) {
    const storage = new DiaryStorage()
    const diary = storage.getById(diaryId)

    const highlightedContent = this.highlightNegativeSentences(
      diary.content,
      analysis
    )

    this.elements.analysisContent.innerHTML = highlightedContent
    this.elements.analysisRewritten.textContent = analysis.rewritten_version

    this.elements.modalAnalysis.classList.remove('hidden')
    this.bindAnalysisModalEvents(diaryId)
  }

  highlightNegativeSentences(content, analysis) {
    if (!analysis.analysis || analysis.analysis.length === 0) {
      return this.escapeHtml(content)
    }

    const negativeIndices = analysis.analysis
      .filter(a => a.is_negative)
      .map(a => a.index)

    const sentences = analysis.sentences

    return sentences.map((sentence, index) => {
      const escaped = this.escapeHtml(sentence)
      if (negativeIndices.includes(index)) {
        return `<span class="negative-sentence" title="${this.escapeHtml(analysis.analysis[index]?.suggestion || '')}">${escaped}</span>`
      }
      return escaped
    }).join('')
  }

  bindAnalysisModalEvents(diaryId) {
    const modal = this.elements.modalAnalysis
    const btnKeepOriginal = modal.querySelector('#btn-keep-original')
    const btnUseRewritten = modal.querySelector('#btn-use-rewritten')
    const btnMinimize = modal.querySelector('#btn-minimize-modal')
    const btnClose = modal.querySelector('#btn-close-modal')

    if (!btnKeepOriginal || !btnUseRewritten || !btnMinimize || !btnClose) {
      console.error('弹窗按钮元素未找到')
      return
    }

    const handler = (fn) => {
      return async () => {
        const storage = new DiaryStorage()
        const diary = storage.getById(diaryId)
        if (diary) {
          await fn(diaryId, diary, storage)
          this.renderDiaryList()
        }
        modal.classList.add('hidden')
        this.showList()
      }
    }

    btnKeepOriginal.onclick = handler((id, diary, storage) => {
      storage.saveFinalVersion(id, diary.content)
      this.showToast('已保留原文')
    })

    btnUseRewritten.onclick = handler((id, diary, storage) => {
      const rewritten = diary?.analysis?.rewritten_version || ''
      const newTitle = diary?.analysis?.title || ''
      if (rewritten) {
        storage.update(id, {
          finalVersion: rewritten,
          title: newTitle || undefined
        })
        this.showToast('已采用改写版本')
      } else {
        this.showToast('没有可用的改写版本')
      }
    })

    const cleanup = () => {
      btnKeepOriginal.onclick = null
      btnUseRewritten.onclick = null
      btnMinimize.onclick = null
      btnClose.onclick = null
    }

    btnMinimize.onclick = () => {
      cleanup()
      modal.classList.add('hidden')
    }

    btnClose.onclick = cleanup
  }

  saveApiKey() {
    const key = this.elements.settingsApiKey.value.trim()
    if (Config.setApiKey(key)) {
      this.showToast('API Key已保存')
      this.showList()
    } else {
      this.showToast('请输入有效的API Key')
    }
  }

  async deleteDiary(id) {
    if (confirm('确定要删除这篇日记吗？')) {
      const storage = new DiaryStorage()
      storage.delete(id)
      this.renderDiaryList()
      this.showToast('日记已删除')
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  updateWordCount() {
    const content = this.elements.editorContent.value
    const count = content.length
    const wordCountEl = document.getElementById('word-count')
    if (wordCountEl) {
      wordCountEl.textContent = `${count} 字`
    }
  }

  bindWordCountEvent() {
    this.elements.editorContent.oninput = () => this.updateWordCount()
  }

  checkApiKey() {
    if (!Config.hasApiKey()) {
      this.showToast('请先设置智谱AI API Key')
      setTimeout(() => this.showSettings(), 1000)
    }
  }

  updateOnlineStatus() {
    const update = () => {
      this.elements.statusOnline.textContent = navigator.onLine ? '在线' : '离线'
      this.elements.statusOnline.className = navigator.onLine ? 'status-online online' : 'status-online offline'
    }

    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  }

  updateQueueCount(count) {
    this.elements.statusCount.textContent = count
    this.elements.statusQueue.style.display = count > 0 ? 'inline' : 'none'
  }

  showToast(message, duration = 3000) {
    const toast = this.elements.toast
    toast.textContent = message
    toast.classList.add('show')

    setTimeout(() => {
      toast.classList.remove('show')
    }, duration)
  }

  formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  extractTitle(content) {
    if (!content) return '无标题'
    const firstLine = content.split('\n')[0].trim()
    return firstLine.length > 30
      ? firstLine.substring(0, 30) + '...'
      : firstLine || '无标题'
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  showAnalysisProgress() {
    const progressPanel = document.getElementById('analysis-progress')
    if (progressPanel) {
      progressPanel.classList.remove('hidden')
      this.updateProgress(0, '正在发送请求...', '准备分析')
    }
    this.bindCancelAnalysis()
  }

  hideAnalysisProgress() {
    const progressPanel = document.getElementById('analysis-progress')
    if (progressPanel) {
      progressPanel.classList.add('hidden')
    }
  }

  updateProgress(percent, statusText, infoText) {
    const progressBar = document.getElementById('progress-bar')
    const progressStatus = document.getElementById('progress-status')
    const progressInfo = document.getElementById('progress-info')

    if (progressBar) {
      progressBar.style.width = `${Math.min(percent, 100)}%`
    }
    if (progressStatus) {
      progressStatus.textContent = statusText || '正在分析...'
    }
    if (progressInfo) {
      progressInfo.textContent = infoText || ''
    }
  }

  setProgressStatus(statusText) {
    const progressStatus = document.getElementById('progress-status')
    if (progressStatus) {
      progressStatus.textContent = statusText
    }
  }

  bindCancelAnalysis() {
    const btnCancel = document.getElementById('btn-cancel-analysis')
    if (btnCancel) {
      btnCancel.onclick = () => {
        this.hideAnalysisProgress()
        this.showToast('已取消分析')
      }
    }
  }
}
