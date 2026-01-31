let ui
let offline

document.addEventListener('DOMContentLoaded', () => {
  initializeApp()
})

function initializeApp() {
  try {
    ui = new UIManager()
    offline = new OfflineQueue()

    setupOfflineListeners()
    setupGlobalErrorHandling()

    ui.showList()

    console.log(`${Config.app.name} v${Config.app.version} 已启动`)

  } catch (error) {
    console.error('应用初始化失败:', error)
    document.body.innerHTML = `
      <div class="error-container">
        <h1>应用初始化失败</h1>
        <p>${error.message}</p>
        <button onclick="location.reload()">重新加载</button>
      </div>
    `
  }
}

function setupOfflineListeners() {
  offline.on('online', () => {
    ui.showToast('网络已连接，正在处理队列...')
  })

  offline.on('offline', () => {
    ui.showToast('网络已断开，内容将暂存后发送')
  })

  offline.on('queueChanged', (data) => {
    ui.updateQueueCount(data?.remaining || offline.getSize())
  })

  offline.on('itemProcessed', () => {
    ui.showToast('已处理1条离线队列')
  })

  offline.on('processingCompleted', () => {
    ui.showToast('所有离线内容已处理完成')
  })

  offline.on('itemFailed', (data) => {
    ui.showToast(`处理失败: ${data.error}`)
  })

  ui.updateQueueCount(offline.getSize())
}

function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason)
    event.preventDefault()

    if (ui) {
      ui.showToast('发生错误，请重试')
    }
  })

  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error)
    event.preventDefault()
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const viewerModal = document.getElementById('modal-viewer')
      if (!viewerModal.classList.contains('hidden')) {
        ui.closeViewer()
      }
    }
  })
}

function showAnalysisModal(diaryId) {
  const storage = new DiaryStorage()
  const diary = storage.getById(diaryId)

  if (diary && diary.analysis) {
    ui.showAnalysisModal(diaryId, diary.analysis)
  }
}

function deleteDiary(id) {
  if (confirm('确定要删除这篇日记吗？')) {
    const storage = new DiaryStorage()
    storage.delete(id)
    ui.renderDiaryList()
    ui.showToast('日记已删除')
  }
}

function exportData() {
  const storage = new DiaryStorage()
  const data = storage.export()

  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `diary-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ui.showToast('导出成功')
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const storage = new DiaryStorage()
        const count = storage.import(event.target.result)
        ui.showToast(`成功导入 ${count} 条日记`)
        ui.renderDiaryList()
      } catch (error) {
        ui.showToast(error.message)
      }
    }
    reader.readAsText(file)
  }

  input.click()
}
