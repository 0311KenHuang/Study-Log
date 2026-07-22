/**
 * app.js - 应用入口
 * 初始化后端连接、加载缓存数据、绑定事件、启动路由
 */

// 异步初始化
async function initApp() {
  // 显示加载状态
  const contentEl = document.getElementById('app-content');
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="w-10 h-10 border-2 border-cream-400 border-t-clay-500 rounded-full animate-spin mb-4"></div>
        <p class="text-sm text-coffee-400">正在连接后端服务...</p>
      </div>
    `;
  }

  try {
    // 初始化示例数据（如果数据库为空）
    await initDemoData();

    // 从后端加载学习目标到本地缓存
    await Goals.loadFromBackend();

    // 确保缓存已加载
    if (!Cache.loaded) {
      await Cache.loadAll();
    }

    // 绑定表单事件
    bindEvents();

    // 启动路由
    Router.init();

    console.log('应用初始化完成，数据已从后端加载');
  } catch (e) {
    console.error('初始化失败:', e);
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="page-container">
          <div class="card p-8 text-center max-w-md mx-auto mt-20">
            <svg class="w-12 h-12 mx-auto mb-4 text-clay-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <h2 class="text-lg font-medium text-coffee-700 mb-2">无法连接到后端服务</h2>
            <p class="text-sm text-coffee-400 mb-4">请确认 Django 服务器已启动</p>
            <div class="bg-cream-100 p-3 rounded-md text-left text-xs text-coffee-500 mb-4">
              <p class="mb-1">启动命令：</p>
              <code class="text-clay-600">.\venv\Scripts\Activate.ps1</code><br>
              <code class="text-clay-600">python manage.py runserver</code>
            </div>
            <p class="text-xs text-coffee-300">后端地址：http://127.0.0.1:8000</p>
            <button onclick="location.reload()" class="btn btn-primary mt-4">重试</button>
          </div>
        </div>
      `;
    }
  }
}

// 绑定事件
function bindEvents() {
  // 表单提交事件委托
  document.addEventListener('submit', async function(e) {
    const form = e.target;
    if (form.tagName !== 'FORM') return;

    // 跳过搜索表单（搜索表单通过 URL 参数驱动，不需要阻止默认行为）
    if (form.id === 'search-form') return;

    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // 首页快速记录表单
      if (form.id === 'quick-record-form') {
        await Records.create(data);
        form.reset();
        Router.navigate();
        return;
      }

      // 今日学习记录表单
      if (form.id === 'today-record-form') {
        await Records.create(data);
        form.reset();
        Router.navigate();
        return;
      }

      // 笔记表单
      if (form.id === 'note-form') {
        const tags = data.tags ? data.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
        await Notes.create({ title: data.title, content: data.content, tags });
        form.reset();
        Router.navigate();
        return;
      }

      // 任务表单
      if (form.id === 'task-form') {
        await Tasks.create(data);
        form.reset();
        Router.navigate();
        return;
      }

      // 学习目标表单（保存到后端 Goals API）
      if (form.id === 'goal-form') {
        const dailyGoal = parseInt(data.dailyGoal) || 120;
        const weeklyGoal = parseInt(data.weeklyGoal) || dailyGoal * 7;
        const monthlyGoal = parseInt(data.monthlyGoal) || dailyGoal * 30;

        // 同步到后端
        await Goals.set('daily', dailyGoal);
        await Goals.set('weekly', weeklyGoal);
        await Goals.set('monthly', monthlyGoal);

        // Goals.set 已自动更新 localStorage 缓存
        Router.navigate();
        return;
      }

      // 分类表单
      if (form.id === 'category-form') {
        const cat = data.category?.trim();
        if (cat) {
          Settings.addCategory(cat);
          form.reset();
          Router.navigate();
        }
        return;
      }

      // 今日随笔快捷表单
      if (form.id === 'quick-thought-form') {
        const content = data.content?.trim();
        if (content) {
          await Notes.create({
            title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
            content: content,
            tags: ['随笔']
          });
          form.reset();
          Router.navigate();
        }
        return;
      }
    } catch (err) {
      console.error('操作失败:', err);
      alert('操作失败，请检查后端服务是否正常');
    }
  });
}

// 启动应用
initApp();
