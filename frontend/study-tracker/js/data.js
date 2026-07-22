/**
 * data.js - 数据管理层
 * 已改为调用后端 Django REST API，数据持久化到 SQLite
 * API 基础地址：http://127.0.0.1:8000/api/
 */

// API 基础地址
const API_BASE = 'http://127.0.0.1:8000/api';

// 默认分类
const DEFAULT_CATEGORIES = ['编程', '英语', '阅读', '写作', '数学', '设计', '其他'];

// 默认设置（仍存于 localStorage，因为这是前端个性化配置）
const DEFAULT_SETTINGS = {
  dailyGoal: 120,
  weeklyGoal: 600,
  monthlyGoal: 2400,
  categories: [...DEFAULT_CATEGORIES],
  weekStartsOn: 1,
};

// ==================== 工具函数 ====================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}小时${m}分`;
  if (h > 0) return `${h}小时`;
  return `${m}分钟`;
}

// localStorage 辅助（仅用于前端设置）
function load(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== fetch 封装 ====================

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${path} 失败: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`POST ${path} 失败: ${res.status}`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PATCH ${path} 失败: ${res.status}`);
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', cache: 'no-store' });
  if (!res.ok && res.status !== 204) throw new Error(`DELETE ${path} 失败: ${res.status}`);
  return true;
}

// ==================== 学习记录 API ====================

const Records = {
  async getAll() {
    return apiGet('/records/');
  },

  async getByDate(date) {
    return apiGet(`/records/?date=${date}`);
  },

  async getByDateRange(start, end) {
    return apiGet(`/records/?start_date=${start}&end_date=${end}`);
  },

  async getByCategory(category) {
    return apiGet(`/records/?category=${encodeURIComponent(category)}`);
  },

  async create(record) {
    const newRecord = {
      date: record.date || getTodayString(),
      subject: record.subject || '',
      duration: parseInt(record.duration) || 0,
      content: record.content || '',
      category: record.category || '其他',
    };
    return apiPost('/records/', newRecord);
  },

  async update(id, updates) {
    return apiPatch(`/records/${id}/`, updates);
  },

  async delete(id) {
    return apiDelete(`/records/${id}/`);
  },

  async getTodayTotal() {
    const data = await apiGet('/records/today/');
    return data.total;
  },

  async getWeekTotal() {
    const data = await apiGet('/records/stats/');
    return data.week_total;
  },

  async getMonthTotal() {
    const data = await apiGet('/records/stats/');
    return data.month_total;
  },

  async getStreak() {
    const data = await apiGet('/records/stats/');
    return data.streak;
  },

  async getStats() {
    return apiGet('/records/stats/');
  },

  async getCategoryStats() {
    const data = await apiGet('/records/stats/');
    return data.category_stats.map(c => ({ name: c.category, duration: c.duration, count: c.count }));
  },

  async getDailyStats(days = 30) {
    return apiGet(`/records/daily_stats/?days=${days}`);
  }
};

// ==================== 笔记 API ====================

const Notes = {
  async getAll() {
    return apiGet('/notes/');
  },

  async getByTag(tag) {
    return apiGet(`/notes/?tag=${encodeURIComponent(tag)}`);
  },

  async search(keyword) {
    return apiGet(`/notes/search/?q=${encodeURIComponent(keyword)}`);
  },

  async create(note) {
    const tags = Array.isArray(note.tags) ? note.tags.join(',') : (note.tags || '');
    return apiPost('/notes/', {
      title: note.title || '',
      content: note.content || '',
      tags: tags,
    });
  },

  async update(id, updates) {
    if (Array.isArray(updates.tags)) {
      updates.tags = updates.tags.join(',');
    }
    return apiPatch(`/notes/${id}/`, updates);
  },

  async delete(id) {
    return apiDelete(`/notes/${id}/`);
  },

  async getAllTags() {
    return apiGet('/notes/all_tags/');
  }
};

// ==================== 任务 API ====================

const Tasks = {
  async getAll() {
    return apiGet('/tasks/');
  },

  async getPending() {
    return apiGet('/tasks/?completed=false');
  },

  async getCompleted() {
    return apiGet('/tasks/?completed=true');
  },

  async getByPriority(priority) {
    return apiGet(`/tasks/?priority=${priority}`);
  },

  async getTodayTasks() {
    return apiGet(`/tasks/?due_date=${getTodayString()}`);
  },

  async create(task) {
    return apiPost('/tasks/', {
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.dueDate || getTodayString(),
      completed: false,
    });
  },

  async update(id, updates) {
    // 字段名转换：前端 dueDate -> 后端 due_date
    if (updates.dueDate) {
      updates.due_date = updates.dueDate;
      delete updates.dueDate;
    }
    return apiPatch(`/tasks/${id}/`, updates);
  },

  async delete(id) {
    return apiDelete(`/tasks/${id}/`);
  },

  async toggleComplete(id) {
    return apiPost(`/tasks/${id}/toggle/`, {});
  },

  async getStats() {
    return apiGet('/tasks/stats/');
  }
};

// ==================== 分类 API ====================

const Categories = {
  async getAll() {
    return apiGet('/categories/');
  },

  async create(name, color = '') {
    return apiPost('/categories/', { name, color, is_default: false });
  },

  async delete(id) {
    return apiDelete(`/categories/${id}/`);
  }
};

// ==================== 学习目标 API ====================

const Goals = {
  async getAll() {
    return apiGet('/goals/');
  },

  async get(period) {
    const all = await this.getAll();
    return all.find(g => g.period === period);
  },

  async set(period, targetMinutes) {
    const existing = await this.get(period);
    if (existing) {
      return apiPatch(`/goals/${existing.id}/`, { target_minutes: targetMinutes });
    } else {
      return apiPost('/goals/', { period, target_minutes: targetMinutes });
    }
  }
};

// ==================== 设置管理（前端本地）====================

const Settings = {
  get() {
    return { ...DEFAULT_SETTINGS, ...load('st_settings', {}) };
  },

  save(settings) {
    save('st_settings', { ...this.get(), ...settings });
  },

  getCategories() {
    return this.get().categories || DEFAULT_CATEGORIES;
  },

  addCategory(category) {
    const cats = this.getCategories();
    if (!cats.includes(category)) {
      cats.push(category);
      this.save({ categories: cats });
    }
  },

  removeCategory(category) {
    const cats = this.getCategories().filter(c => c !== category);
    this.save({ categories: cats });
  },

  getDailyGoal() {
    return this.get().dailyGoal || 120;
  },

  getWeeklyGoal() {
    return this.get().weeklyGoal || 600;
  },

  getMonthlyGoal() {
    return this.get().monthlyGoal || 2400;
  }
};

// ==================== 数据备份（前端封装）====================

const Backup = {
  async exportAll() {
    const [records, notes, tasks, stats] = await Promise.all([
      Records.getAll(),
      Notes.getAll(),
      Tasks.getAll(),
      Records.getStats(),
    ]);
    return {
      records, notes, tasks,
      settings: Settings.get(),
      stats,
      exportTime: new Date().toISOString()
    };
  },

  async importAll(data) {
    // 批量导入：逐条创建（简单实现，避免重复）
    if (data.records) {
      for (const r of data.records) {
        await apiPost('/records/', {
          date: r.date,
          subject: r.subject,
          duration: r.duration,
          content: r.content || '',
          category: r.category || '其他',
        });
      }
    }
    if (data.notes) {
      for (const n of data.notes) {
        await apiPost('/notes/', {
          title: n.title,
          content: n.content,
          tags: Array.isArray(n.tags) ? n.tags.join(',') : (n.tags || ''),
        });
      }
    }
    if (data.tasks) {
      for (const t of data.tasks) {
        await apiPost('/tasks/', {
          title: t.title,
          description: t.description || '',
          priority: t.priority || 'medium',
          due_date: t.due_date || t.dueDate || getTodayString(),
          completed: t.completed || false,
        });
      }
    }
    if (data.settings) {
      Settings.save(data.settings);
    }
  },

  createSnapshot(name) {
    // 简化为前端 localStorage 备份（仅设置）
    const backups = load('st_backups', []);
    backups.unshift({
      id: generateId(),
      name: name || `备份 ${new Date().toLocaleString('zh-CN')}`,
      createdAt: Date.now()
    });
    save('st_backups', backups.slice(0, 20));
    return backups[0];
  },

  getBackups() {
    return load('st_backups', []);
  },

  deleteBackup(id) {
    const backups = this.getBackups().filter(b => b.id !== id);
    save('st_backups', backups);
  },

  clearAll() {
    ['st_settings', 'st_backups', 'st_search_history', 'st_import_history'].forEach(key =>
      localStorage.removeItem(key)
    );
  }
};

// ==================== 兼容性：为异步 API 提供同步降级 ====================
// 由于原 pages.js 中大量使用同步调用，这里提供一个缓存层
// 页面首次加载时预取数据到内存缓存，后续操作直接更新缓存

// 原始异步 API（保留引用，避免被同步覆盖后无法调用）
const _api = {
  async getAllRecords() {
    const res = await apiGet('/records/');
    return Array.isArray(res) ? res : (res.results || []);
  },
  async getAllNotes() {
    const res = await apiGet('/notes/');
    return Array.isArray(res) ? res : (res.results || []);
  },
  async getAllTasks() {
    const res = await apiGet('/tasks/');
    return Array.isArray(res) ? res : (res.results || []);
  },
  async getStats() { return apiGet('/records/stats/'); },
};

const Cache = {
  records: [],
  notes: [],
  tasks: [],
  stats: null,
  loaded: false,

  async loadAll() {
    try {
      const [records, notes, tasks, stats] = await Promise.all([
        _api.getAllRecords(),
        _api.getAllNotes(),
        _api.getAllTasks(),
        _api.getStats(),
      ]);
      this.records = records;
      this.notes = notes.map(n => ({
        ...n,
        tagsStr: n.tags,
        tags: typeof n.tags === 'string' ? n.tags.split(',').map(t => t.trim()).filter(Boolean) : (n.tags || [])
      }));
      this.tasks = tasks.map(t => ({ ...t, dueDate: t.due_date }));
      this.stats = stats;
      this.loaded = true;
    } catch (e) {
      console.error('数据加载失败，请确认后端服务已启动:', e);
      this.loaded = false;
      throw e;
    }
  },

  // 同步读取缓存数据（供 pages.js 使用）
  getRecords() { return this.records; },
  getNotes() { return this.notes; },
  getTasks() { return this.tasks; },
  getStats() { return this.stats; },

  // 刷新单个缓存（直接调用原始 API，避免死循环）
  async refreshRecords() {
    const res = await _api.getAllRecords();
    this.records = res;
    this.stats = await _api.getStats();
  },

  async refreshNotes() {
    const res = await _api.getAllNotes();
    this.notes = res.map(n => ({
      ...n,
      tagsStr: n.tags,
      tags: typeof n.tags === 'string' ? n.tags.split(',').map(t => t.trim()).filter(Boolean) : (n.tags || [])
    }));
  },

  async refreshTasks() {
    const res = await _api.getAllTasks();
    this.tasks = res.map(t => ({ ...t, dueDate: t.due_date }));
  },

  async refreshAll() {
    await this.loadAll();
  }
};

// ==================== 同步包装层（兼容旧 pages.js 调用）====================
// 将异步 API 包装为同步返回（从缓存读取），写入操作仍为异步

// 重写 Records/Notes/Tasks 的同步读取方法（返回缓存）
Records._syncGetAll = function() { return Cache.getRecords(); };
Records._syncGetByDate = function(date) {
  return Cache.getRecords().filter(r => r.date === date);
};
Records._syncGetByDateRange = function(start, end) {
  return Cache.getRecords().filter(r => r.date >= start && r.date <= end);
};
Records._syncGetByCategory = function(category) {
  return Cache.getRecords().filter(r => r.category === category);
};
Records._syncGetTodayTotal = function() {
  const today = getTodayString();
  return Cache.getRecords().filter(r => r.date === today).reduce((s, r) => s + r.duration, 0);
};
Records._syncGetWeekTotal = function() { return Cache.getStats()?.week_total || 0; };
Records._syncGetMonthTotal = function() { return Cache.getStats()?.month_total || 0; };
Records._syncGetStreak = function() { return Cache.getStats()?.streak || 0; };
Records._syncGetCategoryStats = function() {
  return (Cache.getStats()?.category_stats || []).map(c => ({
    name: c.category, duration: c.duration
  }));
};
Records._syncGetDailyStats = function(days = 30) {
  return (Cache.getStats()?.daily_trend || []).slice(-days);
};

Notes._syncGetAll = function() { return Cache.getNotes(); };
Notes._syncGetByTag = function(tag) {
  return Cache.getNotes().filter(n => {
    const tags = typeof n.tags === 'string' ? n.tags.split(',').map(t => t.trim()) : (n.tags || []);
    return tags.includes(tag);
  });
};
Notes._syncSearch = function(keyword) {
  const kw = keyword.toLowerCase();
  return Cache.getNotes().filter(n =>
    n.title.toLowerCase().includes(kw) ||
    n.content.toLowerCase().includes(kw) ||
    (n.tags || '').toLowerCase().includes(kw)
  );
};
Notes._syncGetAllTags = function() {
  const tags = new Set();
  Cache.getNotes().forEach(n => {
    const tagList = typeof n.tags === 'string' ? n.tags.split(',') : (n.tags || []);
    tagList.forEach(t => t.trim() && tags.add(t.trim()));
  });
  return Array.from(tags);
};

Tasks._syncGetAll = function() { return Cache.getTasks(); };
Tasks._syncGetPending = function() { return Cache.getTasks().filter(t => !t.completed); };
Tasks._syncGetCompleted = function() { return Cache.getTasks().filter(t => t.completed); };
Tasks._syncGetByPriority = function(priority) {
  return Cache.getTasks().filter(t => t.priority === priority);
};
Tasks._syncGetTodayTasks = function() {
  const today = getTodayString();
  return Cache.getTasks().filter(t => t.due_date === today);
};
Tasks._syncGetStats = function() {
  const all = Cache.getTasks();
  const completed = all.filter(t => t.completed).length;
  return { total: all.length, completed, pending: all.length - completed };
};

// ==================== 覆盖原同步方法（保持 pages.js 不变）====================

// 覆盖 Records 同步方法
Records.getAll = function() { return this._syncGetAll(); };
Records.getByDate = function(date) { return this._syncGetByDate(date); };
Records.getByDateRange = function(start, end) { return this._syncGetByDateRange(start, end); };
Records.getByCategory = function(cat) { return this._syncGetByCategory(cat); };
Records.getTodayTotal = function() { return this._syncGetTodayTotal(); };
Records.getWeekTotal = function() { return this._syncGetWeekTotal(); };
Records.getMonthTotal = function() { return this._syncGetMonthTotal(); };
Records.getStreak = function() { return this._syncGetStreak(); };
Records.getCategoryStats = function() { return this._syncGetCategoryStats(); };
Records.getDailyStats = function(days) { return this._syncGetDailyStats(days); };

// Records 写操作改为异步 + 刷新缓存
const _origRecordCreate = Records.create.bind(Records);
Records.create = async function(record) {
  const result = await _origRecordCreate(record);
  await Cache.refreshRecords();
  return result;
};
const _origRecordDelete = Records.delete.bind(Records);
Records.delete = async function(id) {
  await _origRecordDelete(id);
  await Cache.refreshRecords();
};

// 覆盖 Notes 同步方法
Notes.getAll = function() { return this._syncGetAll(); };
Notes.getByTag = function(tag) { return this._syncGetByTag(tag); };
Notes.search = function(keyword) { return this._syncSearch(keyword); };
Notes.getAllTags = function() { return this._syncGetAllTags(); };

const _origNoteCreate = Notes.create.bind(Notes);
Notes.create = async function(note) {
  const result = await _origNoteCreate(note);
  await Cache.refreshNotes();
  return result;
};
const _origNoteDelete = Notes.delete.bind(Notes);
Notes.delete = async function(id) {
  await _origNoteDelete(id);
  await Cache.refreshNotes();
};

// 覆盖 Tasks 同步方法
Tasks.getAll = function() { return this._syncGetAll(); };
Tasks.getPending = function() { return this._syncGetPending(); };
Tasks.getCompleted = function() { return this._syncGetCompleted(); };
Tasks.getByPriority = function(priority) { return this._syncGetByPriority(priority); };
Tasks.getTodayTasks = function() { return this._syncGetTodayTasks(); };
Tasks.getStats = function() { return this._syncGetStats(); };

const _origTaskCreate = Tasks.create.bind(Tasks);
Tasks.create = async function(task) {
  const result = await _origTaskCreate(task);
  await Cache.refreshTasks();
  return result;
};
const _origTaskDelete = Tasks.delete.bind(Tasks);
Tasks.delete = async function(id) {
  await _origTaskDelete(id);
  await Cache.refreshTasks();
};
const _origTaskToggle = Tasks.toggleComplete.bind(Tasks);
Tasks.toggleComplete = async function(id) {
  const result = await _origTaskToggle(id);
  await Cache.refreshTasks();
  return result;
};

// ==================== 编辑操作包装（更新后刷新缓存）====================

const _origRecordUpdate = Records.update.bind(Records);
Records.update = async function(id, updates) {
  const result = await _origRecordUpdate(id, updates);
  await Cache.refreshRecords();
  return result;
};

const _origNoteUpdate = Notes.update.bind(Notes);
Notes.update = async function(id, updates) {
  const result = await _origNoteUpdate(id, updates);
  await Cache.refreshNotes();
  return result;
};

const _origTaskUpdate = Tasks.update.bind(Tasks);
Tasks.update = async function(id, updates) {
  const result = await _origTaskUpdate(id, updates);
  await Cache.refreshTasks();
  return result;
};

// ==================== 学习目标后端同步 ====================

const _origGoalSet = Goals.set.bind(Goals);
Goals.set = async function(period, targetMinutes) {
  const result = await _origGoalSet(period, targetMinutes);
  // 同步更新本地缓存，保证页面立即读取最新值
  const key = period === 'daily' ? 'dailyGoal' : period === 'weekly' ? 'weeklyGoal' : 'monthlyGoal';
  Settings.save({ [key]: targetMinutes });
  return result;
};

Goals.loadFromBackend = async function() {
  try {
    const allGoals = await apiGet('/goals/');
    const updates = {};
    for (const g of allGoals) {
      if (g.period === 'daily') updates.dailyGoal = g.target_minutes;
      else if (g.period === 'weekly') updates.weeklyGoal = g.target_minutes;
      else if (g.period === 'monthly') updates.monthlyGoal = g.target_minutes;
    }
    if (Object.keys(updates).length > 0) {
      Settings.save(updates);
    }
  } catch (e) {
    console.warn('加载后端目标数据失败，使用本地设置:', e);
  }
};

// ==================== 初始化（加载示例数据）====================

async function initDemoData() {
  // 检查数据库是否已有数据
  try {
    const stats = await apiGet('/records/stats/');
    if (stats.record_count > 0) {
      // 数据库已有数据，跳过初始化
      await Cache.loadAll();
      return;
    }
  } catch (e) {
    console.error('检查数据失败:', e);
  }

  // 数据库为空，生成示例数据
  const categories = DEFAULT_CATEGORIES;
  const subjects = [
    'JavaScript 高级程序设计', 'Vue3 组合式 API', 'English Reading',
    '算法与数据结构', '设计模式', 'TypeScript 基础',
    'React Hooks', 'Python 数据分析', 'CSS Grid 布局',
    'Node.js 服务端开发'
  ];

  // 生成过去 30 天的学习记录
  const today = new Date();
  const createPromises = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < count; j++) {
      createPromises.push(
        apiPost('/records/', {
          date: dateStr,
          subject: subjects[Math.floor(Math.random() * subjects.length)],
          duration: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
          content: '学习内容记录示例...',
          category: categories[Math.floor(Math.random() * categories.length)]
        })
      );
    }
  }
  await Promise.all(createPromises);

  // 生成示例笔记
  const noteSamples = [
    { title: 'JavaScript 闭包详解', content: '闭包是指有权访问另一个函数作用域中的变量的函数...', tags: ['编程', 'JavaScript'] },
    { title: 'Vue3 Composition API 最佳实践', content: '使用 setup 函数和组合式函数来组织代码逻辑...', tags: ['编程', 'Vue'] },
    { title: '英语阅读理解技巧', content: '先读题目再读文章，抓住关键词定位答案...', tags: ['英语'] },
    { title: '快速排序算法实现', content: '选择一个基准值，将数组分为两部分...', tags: ['编程', '算法'] },
    { title: '设计原则：单一职责', content: '一个类应该只有一个引起它变化的原因...', tags: ['编程', '设计模式'] },
    { title: 'CSS 现代布局指南', content: 'Flexbox 和 Grid 是目前最主流的布局方案...', tags: ['编程', 'CSS'] },
    { title: 'React 状态管理对比', content: 'useState、useReducer、Context、Redux 的使用场景...', tags: ['编程', 'React'] },
    { title: '如何高效阅读技术文档', content: '先浏览目录结构，带着问题去查找答案...', tags: ['阅读', '学习方法'] }
  ];
  for (const n of noteSamples) {
    await apiPost('/notes/', {
      title: n.title,
      content: n.content,
      tags: n.tags.join(',')
    });
  }

  // 生成示例任务
  const taskSamples = [
    { title: '完成 Vue Router 章节学习', description: '阅读官方文档并完成示例代码', priority: 'high', dueDate: getTodayString() },
    { title: '整理本周学习笔记', description: '将分散的笔记统一归档到资料库', priority: 'medium', dueDate: getTodayString() },
    { title: '完成算法练习题 5 道', description: 'LeetCode 简单难度', priority: 'high', dueDate: getTodayString() },
    { title: '阅读《JavaScript 高级程序设计》第 3 章', description: '', priority: 'medium', dueDate: getTodayString() },
    { title: '复习上周英语单词', description: '使用 Anki 复习 50 个单词', priority: 'low', dueDate: getTodayString() },
    { title: '搭建个人博客项目', description: '使用 Next.js 搭建并部署到 Vercel', priority: 'high', dueDate: getTomorrowString() },
    { title: '学习 TypeScript 泛型', description: '理解泛型的基本用法和约束', priority: 'medium', dueDate: getTomorrowString() }
  ];
  for (const t of taskSamples) {
    await apiPost('/tasks/', {
      title: t.title,
      description: t.description,
      priority: t.priority,
      due_date: t.dueDate,
      completed: false
    });
  }

  // 标记第一个任务为已完成
  const allTasks = await Tasks.getAll();
  if (allTasks.length > 0) {
    await Tasks.toggleComplete(allTasks[0].id);
  }

  // 加载缓存
  await Cache.loadAll();
}
