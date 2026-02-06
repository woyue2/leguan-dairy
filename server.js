const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const DATA_DIR = process.env.DATA_DIR || '/data/diary';
const DIARY_FILE = path.join(DATA_DIR, 'diary.json');
const WEEKLY_FILE = path.join(DATA_DIR, 'weekly.json');
const DOING_FILE = path.join(DATA_DIR, 'doing.json');

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('/usr/share/nginx/html'));

// 确保数据目录和文件存在
async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DIARY_FILE);
    } catch {
      await fs.writeFile(DIARY_FILE, '[]');
    }
    try {
      await fs.access(WEEKLY_FILE);
    } catch {
      await fs.writeFile(WEEKLY_FILE, '[]');
    }
    try {
      await fs.access(DOING_FILE);
    } catch {
      await fs.writeFile(DOING_FILE, '[]');
    }
  } catch (error) {
    console.error('Error ensuring data files:', error);
  }
}

// 初始化
ensureDataFiles();

// API 路由

// 获取所有日记
app.get('/api/diaries', async (req, res) => {
  try {
    const data = await fs.readFile(DIARY_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error('Error reading diaries:', error);
    res.json([]); // 总是返回空数组，而不是错误对象
  }
});

// 保存所有日记
app.post('/api/diaries', async (req, res) => {
  try {
    const diaries = req.body;
    await fs.writeFile(DIARY_FILE, JSON.stringify(diaries, null, 2));
    res.json({ success: true, count: diaries.length });
  } catch (error) {
    console.error('Error saving diaries:', error);
    res.status(500).json({ error: 'Failed to save diaries' });
  }
});

// 获取所有周记
app.get('/api/weeklies', async (req, res) => {
  try {
    const data = await fs.readFile(WEEKLY_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error('Error reading weeklies:', error);
    res.json([]); // 总是返回空数组
  }
});

// 保存所有周记
app.post('/api/weeklies', async (req, res) => {
  try {
    const weeklies = req.body;
    await fs.writeFile(WEEKLY_FILE, JSON.stringify(weeklies, null, 2));
    res.json({ success: true, count: weeklies.length });
  } catch (error) {
    console.error('Error saving weeklies:', error);
    res.status(500).json({ error: 'Failed to save weeklies' });
  }
});

// ========== Doing 任务 API ==========

// 获取所有任务
app.get('/api/doing', async (req, res) => {
  try {
    const data = await fs.readFile(DOING_FILE, 'utf8');
    const parsed = JSON.parse(data);
    res.json(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error('Error reading doing tasks:', error);
    res.json([]); // 总是返回空数组
  }
});

// 保存所有任务
app.post('/api/doing', async (req, res) => {
  try {
    const tasks = req.body;
    await fs.writeFile(DOING_FILE, JSON.stringify(tasks, null, 2));
    res.json({ success: true, count: tasks.length });
  } catch (error) {
    console.error('Error saving doing tasks:', error);
    res.status(500).json({ error: 'Failed to save doing tasks' });
  }
});

// 导出数据
app.get('/api/export', async (req, res) => {
  try {
    const diaries = JSON.parse(await fs.readFile(DIARY_FILE, 'utf8'));
    const weeklies = JSON.parse(await fs.readFile(WEEKLY_FILE, 'utf8'));
    const doing = JSON.parse(await fs.readFile(DOING_FILE, 'utf8'));

    const exportData = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      diaries,
      weeklies,
      doing
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// 导入数据
app.post('/api/import', async (req, res) => {
  try {
    const { diaries, weeklies, doing } = req.body;

    if (diaries) {
      await fs.writeFile(DIARY_FILE, JSON.stringify(diaries, null, 2));
    }

    if (weeklies) {
      await fs.writeFile(WEEKLY_FILE, JSON.stringify(weeklies, null, 2));
    }

    if (doing) {
      await fs.writeFile(DOING_FILE, JSON.stringify(doing, null, 2));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const diaries = JSON.parse(await fs.readFile(DIARY_FILE, 'utf8'));
    const weeklies = JSON.parse(await fs.readFile(WEEKLY_FILE, 'utf8'));
    const doing = JSON.parse(await fs.readFile(DOING_FILE, 'utf8'));

    res.json({
      status: 'ok',
      dataDir: DATA_DIR,
      diariesCount: diaries.length,
      weekliesCount: weeklies.length,
      doingCount: doing.length
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Diary app server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
