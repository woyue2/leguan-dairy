class UIManager {
  constructor() {
    this.currentDiaryId = null
    this.currentImages = []
    this.currentStructuredContent = ''
    this.elements = {}
    this.isInsertImageMode = false
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
      btnSaveOnly: document.getElementById('btn-save-only'),
      btnStructure: document.getElementById('btn-structure'),
      btnViewOriginal: document.getElementById('btn-view-original'),
      btnApiKey: document.getElementById('btn-api-key'),
      btnWeekly: document.getElementById('btn-weekly'),
      btnBackToList: document.getElementById('btn-back-to-list'),
      diaryList: document.getElementById('diary-list'),
      weeklyList: document.getElementById('weekly-list'),
      editorContent: document.getElementById('editor-content'),
      editorTitle: document.getElementById('editor-title'),
      statusOnline: document.getElementById('status-online'),
      statusQueue: document.getElementById('status-queue'),
      statusCount: document.getElementById('status-count'),
      modalAnalysis: document.getElementById('modal-analysis'),
      modalStructure: document.getElementById('modal-structure'),
      modalOriginal: document.getElementById('modal-original'),
      modalSettings: document.getElementById('modal-settings'),
      modalWeekly: document.getElementById('modal-weekly'),
      analysisContent: document.getElementById('analysis-content'),
      analysisRewritten: document.getElementById('analysis-rewritten'),
      structureContent: document.getElementById('structure-content'),
      originalContent: document.getElementById('original-content'),
      btnCloseStructure: document.getElementById('btn-close-structure'),
      btnUseStructure: document.getElementById('btn-use-structure'),
      btnCancelStructure: document.getElementById('btn-cancel-structure'),
      btnCloseOriginal: document.getElementById('btn-close-original'),
      btnCloseOriginalFooter: document.getElementById('btn-close-original-footer'),
      settingsApiKey: document.getElementById('settings-api-key'),
      toast: document.getElementById('toast'),
      btnInsertImage: document.getElementById('btn-insert-image'),
      modalInsertImage: document.getElementById('modal-insert-image'),
      btnCloseImageModal: document.getElementById('btn-close-image-modal'),
      btnCancelInsert: document.getElementById('btn-cancel-insert'),
      btnConfirmInsert: document.getElementById('btn-confirm-insert'),
      imageUrlInput: document.getElementById('image-url-input'),
      editorImages: document.getElementById('editor-images')
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
    if (this.elements.btnSaveOnly) {
      this.elements.btnSaveOnly.addEventListener('click', () => this.handleSaveOnly())
    }
    if (this.elements.btnStructure) {
      this.elements.btnStructure.addEventListener('click', () => this.handleStructureAnalysis())
    }
    if (this.elements.btnViewOriginal) {
      this.elements.btnViewOriginal.addEventListener('click', () => this.showOriginalModal())
    }
    if (this.elements.btnApiKey) {
      this.elements.btnApiKey.addEventListener('click', () => this.saveApiKey())
    }
    if (this.elements.btnWeekly) {
      this.elements.btnWeekly.addEventListener('click', () => this.showWeeklyGenerator())
    }
    if (this.elements.btnBackToList) {
      this.elements.btnBackToList.addEventListener('click', () => this.showList())
    }
    if (this.elements.btnInsertImage) {
      this.elements.btnInsertImage.addEventListener('click', () => this.showInsertImageModal())
    }
    if (this.elements.btnCloseImageModal) {
      this.elements.btnCloseImageModal.addEventListener('click', () => this.hideInsertImageModal())
    }
    if (this.elements.btnCancelInsert) {
      this.elements.btnCancelInsert.addEventListener('click', () => this.hideInsertImageModal())
    }
    if (this.elements.btnConfirmInsert) {
      this.elements.btnConfirmInsert.addEventListener('click', () => this.insertImage())
    }
    if (this.elements.editorContent) {
      this.elements.editorContent.addEventListener('paste', (e) => this.handlePaste(e))
    }
    if (this.elements.editorImages) {
      this.elements.editorImages.addEventListener('click', (e) => this.handleRemoveImage(e))
    }
    if (this.elements.btnCloseStructure) {
      this.elements.btnCloseStructure.addEventListener('click', () => this.hideStructureModal())
    }
    if (this.elements.btnCancelStructure) {
      this.elements.btnCancelStructure.addEventListener('click', () => this.hideStructureModal())
    }
    if (this.elements.btnUseStructure) {
      this.elements.btnUseStructure.addEventListener('click', () => this.saveStructuredVersion())
    }
    if (this.elements.btnCloseOriginal) {
      this.elements.btnCloseOriginal.addEventListener('click', () => this.hideOriginalModal())
    }
    if (this.elements.btnCloseOriginalFooter) {
      this.elements.btnCloseOriginalFooter.addEventListener('click', () => this.hideOriginalModal())
    }
  }

  showInsertImageModal() {
    this.isInsertImageMode = true
    this.elements.imageUrlInput.value = ''
    this.elements.modalInsertImage.classList.remove('hidden')
    this.elements.imageUrlInput.focus()
  }

  hideInsertImageModal() {
    this.isInsertImageMode = false
    this.elements.modalInsertImage.classList.add('hidden')
  }

  insertImage() {
    const url = this.elements.imageUrlInput.value.trim()
    if (!url) {
      this.showToast('请输入图片链接')
      return
    }

    if (!this.currentImages.includes(url)) {
      this.currentImages.push(url)
    }
    this.hideInsertImageModal()
    this.updateWordCount()
    this.updateImagePreview()
    this.elements.editorContent.focus()
  }

  handlePaste(e) {
    if (this.isInsertImageMode) {
      return
    }
    if (this.elements.modalInsertImage && !this.elements.modalInsertImage.classList.contains('hidden')) {
      return
    }
    if (document.activeElement === this.elements.imageUrlInput) {
      return
    }
    const paste = (e.clipboardData || window.clipboardData).getData('text')
    if (paste && paste.match(/^https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) {
      e.preventDefault()
      if (!this.currentImages.includes(paste)) {
        this.currentImages.push(paste)
      }
      this.updateWordCount()
      this.updateImagePreview()
      this.showToast('已自动识别并插入图片链接')
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
        const normalized = this.normalizeDiaryContent(diary)
        this.elements.editorContent.value = normalized.content
        this.currentImages = normalized.images
        this.currentStructuredContent = diary.structured_version || ''
        this.currentDiaryId = diaryId
      }
    } else {
      this.elements.editorTitle.value = ''
      this.elements.editorContent.value = ''
      this.currentImages = []
      this.currentStructuredContent = ''
      this.currentDiaryId = null
    }
    this.updateWordCount()
    this.updateImagePreview()
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

    this.elements.diaryList.innerHTML = diaries.map(diary => {
      const normalized = this.normalizeDiaryContent(diary)
      const content = normalized.content
      const images = normalized.images
      const thumbUrl = images[0] || null
      const previewText = content.substring(0, 100)

      return `
      <div class="diary-card" data-id="${diary.id}">
        <div class="diary-card-body">
          ${thumbUrl ? `<img src="${this.escapeHtml(thumbUrl)}" class="diary-thumbnail" onerror="this.style.display='none'">` : ''}
          <div class="diary-card-main">
            <div class="diary-card-header">
              <h3 class="diary-card-title">${this.escapeHtml(diary.title)}</h3>
              <span class="diary-card-date">${this.formatDate(diary.date)}</span>
            </div>
            <p class="diary-card-preview">${this.escapeHtml(previewText)}...</p>
            <div class="diary-card-footer">
              <div class="diary-card-actions">
                <button class="btn-small" onclick="ui.showViewer('${diary.id}')">查看</button>
                <button class="btn-small" onclick="ui.showEditor('${diary.id}')">编辑</button>
                <button class="btn-small btn-danger" onclick="ui.deleteDiary('${diary.id}')">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `}).join('')
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
      const updates = { content, title, images: [...this.currentImages] }

      if (this.currentDiaryId) {
        const existing = storage.getById(this.currentDiaryId)
        if (existing && !existing.original_content) {
          updates.original_content = existing.content || content
        }
        if (existing?.structured_version) {
          updates.structured_version = content
        }
      }

      if (this.currentDiaryId) {
        diary = storage.update(this.currentDiaryId, updates)
      } else {
        diary = storage.create(updates)
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

  async handleSaveOnly() {
    const content = this.elements.editorContent.value.trim()
    const title = this.elements.editorTitle.value.trim() ||
      this.extractTitle(content)

    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    const storage = new DiaryStorage()

    try {
      const updates = {
        content,
        title,
        images: [...this.currentImages],
        analysis: null,
        finalVersion: null
      }

      if (this.currentDiaryId) {
        const existing = storage.getById(this.currentDiaryId)
        if (existing && !existing.original_content) {
          updates.original_content = existing.content || content
        }
        if (existing?.structured_version) {
          updates.structured_version = content
        }
        storage.update(this.currentDiaryId, updates)
      } else {
        const diary = storage.create(updates)
        this.currentDiaryId = diary.id
      }

      this.renderDiaryList()
      this.showToast('已保存（未分析）')
    } catch (error) {
      this.showToast(error.message)
    }
  }

  async handleStructureAnalysis() {
    const content = this.elements.editorContent.value.trim()
    if (content.length < Config.validation.minContentLength) {
      this.showToast('内容太短，至少需要5个字符')
      return
    }

    const api = new ZhipuAPI()
    this.showStructureProgress(() => api.abort())

    try {
      const result = await api.analyzeStructure(content, (percent, status, info) => {
        this.updateProgress(percent, status, info)
      })
      this.hideAnalysisProgress()
      this.currentStructuredContent = result.structured_version || ''
      this.showStructureModal(this.currentStructuredContent)
    } catch (error) {
      this.hideAnalysisProgress()
      if (error.message.includes('请求频率')) {
        this.showToast(error.message)
      } else if (error.message.includes('网络') || error.message.includes('取消')) {
        this.showToast('网络问题，请稍后重试')
      } else if (error.message.includes('超时')) {
        this.showToast('结构优化超时，请重试')
      } else {
        this.showToast(error.message)
      }
    }
  }

  showStructureModal(content) {
    if (this.elements.structureContent) {
      this.elements.structureContent.innerHTML = this.renderStructureContent(content)
    }
    if (this.elements.modalStructure) {
      this.elements.modalStructure.classList.remove('hidden')
    }
  }

  hideStructureModal() {
    if (this.elements.modalStructure) {
      this.elements.modalStructure.classList.add('hidden')
    }
  }

  saveStructuredVersion() {
    if (!this.currentStructuredContent) {
      this.showToast('没有可保存的优化内容')
      return
    }

    const storage = new DiaryStorage()
    const title = this.elements.editorTitle.value.trim() ||
      this.extractTitle(this.currentStructuredContent)

    if (this.currentDiaryId) {
      const existing = storage.getById(this.currentDiaryId)
      const updates = {
        structured_version: this.currentStructuredContent,
        finalVersion: this.currentStructuredContent
      }
      if (existing && !existing.original_content) {
        updates.original_content = existing.content || this.elements.editorContent.value.trim()
      }
      storage.update(this.currentDiaryId, updates)
    } else {
      const diary = storage.create({
        title,
        content: this.elements.editorContent.value.trim(),
        original_content: this.elements.editorContent.value.trim(),
        structured_version: this.currentStructuredContent,
        finalVersion: this.currentStructuredContent,
        images: [...this.currentImages]
      })
      this.currentDiaryId = diary.id
    }

    this.elements.editorContent.value = this.currentStructuredContent
    this.updateWordCount()
    this.hideStructureModal()
    this.renderDiaryList()
    this.showToast('结构优化已保存')
  }

  showOriginalModal() {
    if (!this.currentDiaryId) {
      this.showToast('暂无可查看的原文')
      return
    }
    const storage = new DiaryStorage()
    const diary = storage.getById(this.currentDiaryId)
    if (!diary) {
      this.showToast('日记不存在')
      return
    }
    const original = diary.original_content || diary.content || ''
    if (this.elements.originalContent) {
      this.elements.originalContent.textContent = original
    }
    if (this.elements.modalOriginal) {
      this.elements.modalOriginal.classList.remove('hidden')
    }
  }

  hideOriginalModal() {
    if (this.elements.modalOriginal) {
      this.elements.modalOriginal.classList.add('hidden')
    }
  }

  showAnalysisModal(diaryId, analysis) {
    const storage = new DiaryStorage()
    const diary = storage.getById(diaryId)

    const baseContent = this.getDiaryEffectiveContent(diary)
    const highlightedContent = this.highlightNegativeSentences(baseContent, analysis)

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

  splitTreeContent(content) {
    const text = (content || '').trim()
    if (!text) {
      return { bodyText: '', treeText: '' }
    }
    const treeMatch = text.match(/\n\s*目录树[:：]\s*\n/i)
    if (!treeMatch) {
      return { bodyText: text, treeText: '' }
    }
    const splitIndex = treeMatch.index ?? -1
    if (splitIndex < 0) {
      return { bodyText: text, treeText: '' }
    }
    return {
      bodyText: text.slice(0, splitIndex).trim(),
      treeText: text.slice(splitIndex + treeMatch[0].length).trim()
    }
  }

  renderStructureContent(content) {
    const { bodyText, treeText } = this.splitTreeContent(content)
    if (!bodyText && !treeText) {
      return ''
    }
    const blocks = bodyText.split(/\n{2,}/).map(block => block.trim()).filter(Boolean)
    const paragraphs = blocks.length > 0 ? blocks : bodyText.split('\n').map(block => block.trim()).filter(Boolean)
    let html = paragraphs.map(paragraph => `<p class="structure-paragraph">${this.escapeHtml(paragraph)}</p>`).join('')

    if (treeText) {
      html += `<div class="structure-tree-title">目录树</div>`
      html += `<pre class="structure-tree">${this.escapeHtml(treeText)}</pre>`
    }

    return html
  }

  bindAnalysisModalEvents(diaryId) {
    const modal = this.elements.modalAnalysis
    const btnKeepOriginal = modal.querySelector('#btn-keep-original')
    const btnUseRewritten = modal.querySelector('#btn-use-rewritten')
    const btnRegenerate = modal.querySelector('#btn-regenerate-analysis')
    const btnMinimize = modal.querySelector('#btn-minimize-modal')
    const btnClose = modal.querySelector('#btn-close-modal')

    if (!btnKeepOriginal || !btnUseRewritten || !btnRegenerate || !btnMinimize || !btnClose) {
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
      const baseContent = this.getDiaryEffectiveContent(diary)
      storage.saveFinalVersion(id, baseContent)
      this.showToast('已保留原文')
    })

    btnUseRewritten.onclick = handler((id, diary, storage) => {
      const rewritten = diary?.analysis?.rewritten_version || ''
      const newTitle = diary?.analysis?.title || ''
      if (rewritten) {
        storage.update(id, {
          finalVersion: rewritten,
          structured_version: rewritten,
          title: newTitle || undefined
        })
        this.showToast('已采用改写版本')
      } else {
        this.showToast('没有可用的改写版本')
      }
    })

    btnRegenerate.onclick = async () => {
      const storage = new DiaryStorage()
      const diary = storage.getById(diaryId)
      if (!diary) return
      const baseContent = this.getDiaryEffectiveContent(diary)

      btnRegenerate.disabled = true
      btnRegenerate.textContent = '生成中...'

      try {
        const api = new ZhipuAPI()
        const result = await api.analyze(baseContent, (percent, status, info) => {
          this.updateProgress(percent, status, info)
        })

        storage.saveAnalysis(diaryId, result)

        this.showAnalysisModal(diaryId, result)
        this.showToast('已重新生成')

      } catch (error) {
        this.showToast(error.message)
      } finally {
        btnRegenerate.disabled = false
        btnRegenerate.textContent = '重新生成'
      }
    }

    const cleanup = () => {
      btnKeepOriginal.onclick = null
      btnUseRewritten.onclick = null
      btnRegenerate.onclick = null
      btnMinimize.onclick = null
    }

    btnMinimize.onclick = () => {
      modal.classList.add('hidden')
    }

    btnClose.onclick = () => {
      modal.classList.add('hidden')
      cleanup()
    }
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
    this.elements.editorContent.oninput = () => {
      this.updateWordCount()
      this.updateImagePreview()
    }
  }

  updateImagePreview() {
    if (!this.elements.editorImages) return
    if (this.currentImages.length === 0) {
      this.elements.editorImages.innerHTML = ''
      this.elements.editorImages.classList.add('hidden')
      return
    }

    this.elements.editorImages.classList.remove('hidden')
    this.elements.editorImages.innerHTML = this.currentImages.map(url => `
      <div class="editor-image-item">
        <img src="${this.escapeHtml(url)}" alt="图片">
        <button class="editor-image-remove" data-url="${this.escapeHtml(url)}">×</button>
      </div>
    `).join('')
  }

  handleRemoveImage(e) {
    const button = e.target.closest('.editor-image-remove')
    if (!button) return
    const url = button.dataset.url
    if (!url) return
    this.currentImages = this.currentImages.filter(item => item !== url)
    this.updateImagePreview()
    this.updateWordCount()
  }

  normalizeDiaryContent(diary) {
    const rawContent = diary.structured_version || diary.finalVersion || diary.content || ''
    const images = Array.isArray(diary.images) ? [...diary.images] : []
    const lines = rawContent.split('\n')
    const filtered = lines.filter(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('img:')) {
        const url = trimmed.replace(/^img:/, '').trim()
        if (url && !images.includes(url)) {
          images.push(url)
        }
        return false
      }
      return true
    })
    return { content: filtered.join('\n').trim(), images }
  }

  getDiaryEffectiveContent(diary) {
    if (!diary) return ''
    return diary.structured_version || diary.finalVersion || diary.content || ''
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

  showStructureProgress(onCancel) {
    const progressPanel = document.getElementById('analysis-progress')
    if (progressPanel) {
      progressPanel.classList.remove('hidden')
      this.updateProgress(0, '正在结构优化...', '准备优化')
    }
    this.bindCancelAnalysis(onCancel, '已取消结构优化')
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

  bindCancelAnalysis(onCancel, message) {
    const btnCancel = document.getElementById('btn-cancel-analysis')
    if (btnCancel) {
      btnCancel.onclick = () => {
        this.hideAnalysisProgress()
        this.showToast(message || '已取消分析')
        if (onCancel) {
          onCancel()
        }
      }
    }
  }

  viewerFontSize = 18
  viewerCurrentDiaryId = null
  viewerDiaries = []

  showViewer(diaryId) {
    const storage = new DiaryStorage()
    this.viewerDiaries = storage.getAll()

    const currentIndex = this.viewerDiaries.findIndex(d => d.id === diaryId)
    if (currentIndex === -1) {
      this.showToast('日记不存在')
      return
    }

    this.viewerCurrentDiaryId = diaryId
    this.viewerFontSize = 18

    this.renderViewerContent(diaryId)
    this.updateViewerNavigation()
    this.updateViewerFontSize()

    const modal = document.getElementById('modal-viewer')
    modal.classList.remove('hidden')
    modal.className = 'modal-overlay viewer-overlay'

    document.body.style.overflow = ''
  }

  closeViewer() {
    const modal = document.getElementById('modal-viewer')
    modal.classList.add('hidden')
    document.body.style.overflow = ''
  }

  renderViewerContent(diaryId) {
    const storage = new DiaryStorage()
    const diary = storage.getById(diaryId)
    if (!diary) return

    const normalized = this.normalizeDiaryContent(diary)
    const { bodyText, treeText } = this.splitTreeContent(normalized.content)
    const content = bodyText
    const article = document.getElementById('viewer-article')
    const images = normalized.images

    const paragraphs = content.split('\n').filter(p => p.trim())

    let html = `
      <h1 class="viewer-title">${this.escapeHtml(diary.title)}</h1>
      <div class="viewer-date">${this.formatDate(diary.date)}</div>
    `

    if (images.length > 0) {
      html += images.map(url => `
        <img src="${this.escapeHtml(url)}" onerror="this.outerHTML='<div class=\\'image-placeholder\\'>图片加载失败</div>'">
      `).join('')
    }

    paragraphs.forEach((para, index) => {
      if (index === 0 && para.length > 0) {
        const firstChar = para[0]
        const rest = para.slice(1)
        html += `<p><span class="viewer-first-letter">${this.escapeHtml(firstChar)}</span><span class="viewer-content">${this.escapeHtml(rest)}</span></p>`
      } else if (para.trim()) {
        html += `<p class="viewer-content">${this.escapeHtml(para)}</p>`
      }

      if (index > 0 && index % 3 === 0 && index < paragraphs.length - 1) {
        html += `<div class="viewer-chapter-divider">第 ${Math.floor(index / 3) + 1} 章</div>`
      }
    })

    if (treeText) {
      html += `<div class="viewer-tree-title">目录树</div>`
      html += `<pre class="viewer-tree">${this.escapeHtml(treeText)}</pre>`
    }

    article.innerHTML = html
    article.style.fontSize = `${this.viewerFontSize}px`
  }

  setViewerTheme(theme) {
    const modal = document.getElementById('modal-viewer')
    modal.className = 'modal-overlay viewer-overlay'

    if (theme !== 'light') {
      modal.classList.add(theme)
    }
  }

  adjustViewerFontSize(delta) {
    this.viewerFontSize = Math.max(14, Math.min(28, this.viewerFontSize + delta))
    const article = document.getElementById('viewer-article')
    if (article) {
      article.style.fontSize = `${this.viewerFontSize}px`
    }
    this.updateViewerFontSize()
  }

  updateViewerFontSize() {
    const fontSizeEl = document.getElementById('viewer-font-size')
    if (fontSizeEl) {
      fontSizeEl.textContent = `${this.viewerFontSize}px`
    }
  }

  navigateViewer(direction) {
    const storage = new DiaryStorage()
    const diaries = storage.getAll()
    const currentIndex = diaries.findIndex(d => d.id === this.viewerCurrentDiaryId)

    let newIndex
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : diaries.length - 1
    } else {
      newIndex = currentIndex < diaries.length - 1 ? currentIndex + 1 : 0
    }

    if (diaries[newIndex]) {
      this.viewerCurrentDiaryId = diaries[newIndex].id
      this.renderViewerContent(diaries[newIndex].id)
      this.updateViewerNavigation()
    }
  }

  updateViewerNavigation() {
    const btnPrev = document.getElementById('btn-prev-diary')
    const btnNext = document.getElementById('btn-next-diary')

    const storage = new DiaryStorage()
    const diaries = storage.getAll()

    if (diaries.length <= 1) {
      btnPrev.style.visibility = 'hidden'
      btnNext.style.visibility = 'hidden'
    } else {
      btnPrev.style.visibility = 'visible'
      btnNext.style.visibility = 'visible'
    }
  }

  // ========== 周记相关方法 ==========

  currentWeeklyData = null

  async showWeeklyGenerator() {
    const storage = new DiaryStorage()
    const weekInfo = storage.getCurrentWeekInfo()
    const diaries = storage.getDiariesForWeek(weekInfo.year, weekInfo.weekNumber)
    const dayCount = diaries.length

    if (dayCount < 4) {
      this.showWeeklyEmpty(dayCount, 7)
      return
    }

    this.showWeeklyModal()

    this.showWeeklyProgress(true, 0, '正在收集本周日记...', '准备生成')

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      this.currentWeeklyData = {
        ...weekInfo,
        diaryIds: diaries.map(d => d.id),
        title: result.title,
        summary: result.summary
      }

      this.showWeeklyResult(result.title, result.summary)
      this.bindWeeklyModalEvents()

    } catch (error) {
      this.showToast(error.message)
      this.hideWeeklyModal()
    }
  }

  async forceGenerateWeekly() {
    const storage = new DiaryStorage()
    const weekInfo = storage.getCurrentWeekInfo()
    const diaries = storage.getDiariesForWeek(weekInfo.year, weekInfo.weekNumber)
    const dayCount = diaries.length

    this.showWeeklyModal()
    this.showWeeklyProgress(true, 0, '正在生成周记...', `注意：仅有 ${dayCount} 天日记`)

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      this.currentWeeklyData = {
        ...weekInfo,
        diaryIds: diaries.map(d => d.id),
        title: result.title,
        summary: result.summary
      }

      this.showWeeklyResult(result.title, result.summary)
      this.bindWeeklyModalEvents()
      this.showToast('周记已生成（天数较少，可能不够有代表性）')

    } catch (error) {
      this.showToast(error.message)
      this.hideWeeklyModal()
    }
  }

  showWeeklyModal() {
    const modal = document.getElementById('modal-weekly')
    if (modal) {
      modal.classList.remove('hidden')
      this.bindWeeklyModalEvents()
    }
  }

  hideWeeklyModal() {
    const modal = document.getElementById('modal-weekly')
    if (modal) {
      modal.classList.add('hidden')
      this.currentWeeklyData = null
    }
  }

  showWeeklyProgress(show, percent, status, info) {
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')

    if (progress) {
      show ? progress.classList.remove('hidden') : progress.classList.add('hidden')
    }
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.add('hidden')

    this.updateWeeklyProgress(percent, status, info)
  }

  updateWeeklyProgress(percent, status, info) {
    const progressBar = document.getElementById('weekly-progress-bar')
    const progressStatus = document.getElementById('weekly-progress-status')
    const progressInfo = document.getElementById('weekly-progress-info')

    if (progressBar) {
      progressBar.style.width = `${Math.min(percent, 100)}%`
    }
    if (progressStatus) {
      progressStatus.textContent = status || '正在生成周记...'
    }
    if (progressInfo) {
      progressInfo.textContent = info || ''
    }
  }

  showWeeklyEmpty(currentDay = 0, totalDays = 7) {
    this.showWeeklyModal()

    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')
    const title = document.getElementById('weekly-modal-title')

    if (progress) progress.classList.add('hidden')
    if (result) result.classList.add('hidden')
    if (empty) empty.classList.remove('hidden')
    if (footer) footer.classList.add('hidden')
    if (title) title.textContent = '周记生成'

    const btnClose = document.getElementById('btn-close-weekly')
    if (btnClose) {
      btnClose.onclick = () => this.hideWeeklyModal()
    }

    const emptyContent = document.getElementById('weekly-empty')
    if (emptyContent) {
      emptyContent.innerHTML = `
        <div class="weekly-empty-content">
          <div class="weekly-day-count">
            <span class="count-number">${currentDay}</span>
            <span class="count-total">/${totalDays} 天</span>
          </div>
          <p class="weekly-tip">至少需要4天才能生成有代表性的周记</p>
          <div class="weekly-actions">
            <button class="btn btn-primary" onclick="ui.hideWeeklyModal(); ui.showEditor()">继续写日记</button>
            ${currentDay > 0 ? `<button class="btn btn-secondary" onclick="ui.forceGenerateWeekly()">强制生成（可能不够有代表性）</button>` : ''}
          </div>
        </div>
      `
    }
  }

  showWeeklyResult(title, summary) {
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')

    const titleEl = document.getElementById('weekly-title')
    const summaryEl = document.getElementById('weekly-summary')

    if (progress) progress.classList.add('hidden')
    if (result) result.classList.remove('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.remove('hidden')

    if (titleEl) titleEl.textContent = title
    if (summaryEl) summaryEl.textContent = summary
  }

  bindWeeklyModalEvents() {
    const btnClose = document.getElementById('btn-close-weekly')
    const btnRegenerate = document.getElementById('btn-regenerate-weekly')
    const btnSave = document.getElementById('btn-save-weekly')

    if (btnClose) {
      btnClose.onclick = () => this.hideWeeklyModal()
    }

    if (btnRegenerate) {
      btnRegenerate.onclick = () => this.regenerateWeekly()
    }

    if (btnSave) {
      btnSave.onclick = () => this.saveWeekly()
    }
  }

  async regenerateWeekly() {
    if (!this.currentWeeklyData) return

    const storage = new DiaryStorage()
    const diaries = storage.getDiariesForWeek(
      this.currentWeeklyData.year,
      this.currentWeeklyData.weekNumber
    )

    this.showWeeklyProgress(true, 0, '重新生成周记...', '准备中')

    try {
      const api = new ZhipuAPI()
      const result = await api.generateWeeklySummary(diaries, (percent, status, info) => {
        this.updateWeeklyProgress(percent, status, info)
      })

      this.currentWeeklyData.title = result.title
      this.currentWeeklyData.summary = result.summary

      this.showWeeklyResult(result.title, result.summary)
      this.showToast('周记已重新生成')

    } catch (error) {
      this.showToast(error.message)
    }
  }

  saveWeekly() {
    if (!this.currentWeeklyData) return

    const storage = new DiaryStorage()
    const weekly = storage.createWeekly(this.currentWeeklyData)

    this.hideWeeklyModal()
    this.showWeeklyList()
    this.showToast('周记已保存')
  }

  showWeeklyList() {
    this.renderWeeklyList()
    this.showView('weekly')
  }

  renderWeeklyList() {
    const storage = new DiaryStorage()
    const weeklies = storage.getAllWeekly()

    const listEl = document.getElementById('weekly-list')

    if (weeklies.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>还没有周记</p>
          <button class="btn btn-primary" onclick="ui.showWeeklyGenerator()">生成第一篇周记</button>
        </div>
      `
      return
    }

    listEl.innerHTML = weeklies.map(weekly => {
      const startDate = new Date(weekly.startDate)
      const endDate = new Date(weekly.endDate)
      const dateRange = `${startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`

      return `
        <div class="weekly-card" onclick="ui.viewWeekly('${weekly.id}')">
          <div class="weekly-card-header">
            <h3 class="weekly-card-title">${this.escapeHtml(weekly.title)}</h3>
            <span class="weekly-card-date">${dateRange}</span>
          </div>
          <p class="weekly-card-summary">${this.escapeHtml(weekly.summary.substring(0, 150))}...</p>
          <div class="weekly-card-footer">
            <button class="btn-small" onclick="event.stopPropagation(); ui.deleteWeekly('${weekly.id}')">删除</button>
          </div>
        </div>
      `
    }).join('')
  }

  viewWeekly(id) {
    const storage = new DiaryStorage()
    const weekly = storage.getWeeklyById(id)

    if (!weekly) {
      this.showToast('周记不存在')
      return
    }

    this.currentWeeklyData = weekly

    const modal = document.getElementById('modal-weekly')
    const titleEl = document.getElementById('weekly-modal-title')
    const progress = document.getElementById('weekly-progress')
    const result = document.getElementById('weekly-result')
    const empty = document.getElementById('weekly-empty')
    const footer = document.getElementById('weekly-modal-footer')

    if (titleEl) titleEl.textContent = '周记详情'
    if (progress) progress.classList.add('hidden')
    if (result) result.classList.remove('hidden')
    if (empty) empty.classList.add('hidden')
    if (footer) footer.classList.remove('hidden')

    const titleResultEl = document.getElementById('weekly-title')
    const summaryResultEl = document.getElementById('weekly-summary')

    if (titleResultEl) titleResultEl.textContent = weekly.title
    if (summaryResultEl) summaryResultEl.textContent = weekly.summary

    const btnRegenerate = document.getElementById('btn-regenerate-weekly')
    const btnSave = document.getElementById('btn-save-weekly')

    if (btnRegenerate) {
      btnRegenerate.textContent = '重新生成'
      btnRegenerate.onclick = () => this.regenerateWeekly()
    }

    if (btnSave) {
      btnSave.style.display = 'none'
    }

    const btnClose = document.getElementById('btn-close-weekly')
    if (btnClose) {
      btnClose.onclick = () => {
        this.hideWeeklyModal()
        this.renderWeeklyList()
      }
    }

    modal.classList.remove('hidden')
  }

  deleteWeekly(id) {
    if (confirm('确定要删除这篇周记吗？')) {
      const storage = new DiaryStorage()
      storage.deleteWeekly(id)
      this.renderWeeklyList()
      this.showToast('周记已删除')
    }
  }
}
