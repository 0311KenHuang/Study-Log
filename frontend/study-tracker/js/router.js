/**
 * router.js - 原生 JavaScript 路由系统
 * 基于 hash 路由实现 SPA 页面切换
 * 已改为异步导航：每次切换页面前先从后端拉取最新数据，保证前后端同步
 */

const Router = {
  // 当前路由
  currentRoute: 'home',

  // 路由映射表
  routes: {
    home: { title: '首页', render: renderHome },
    today: { title: '今日学习', render: renderToday },
    calendar: { title: '日历档案', render: renderCalendar },
    stats: { title: '数据统计', render: renderStats },
    notes: { title: '笔记资料库', render: renderNotes },
    search: { title: '检索查询', render: renderSearch },
    tasks: { title: '计划任务', render: renderTasks },
    backup: { title: '数据备份', render: renderBackup },
    settings: { title: '设置', render: renderSettings }
  },

  // 是否正在导航中（防止重复触发）
  _navigating: false,

  // 初始化路由
  init() {
    // 监听 hash 变化
    window.addEventListener('hashchange', () => this.navigate());

    // 监听导航链接点击
    document.querySelectorAll('#nav-links a[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        const route = link.getAttribute('data-route');
        if (route === this.currentRoute) {
          e.preventDefault();
          return;
        }
        this.currentRoute = route;
        this.updateNavActive();
      });
    });

    // 初始导航
    this.navigate();
  },

  // 执行导航（异步：先拉取后端最新数据，再渲染页面）
  async navigate() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const route = this.routes[hash];

    if (!route) {
      window.location.hash = 'home';
      return;
    }

    // 防止重复导航
    if (this._navigating) return;
    this._navigating = true;

    this.currentRoute = hash;
    document.title = `${route.title} - 每日学习记录`;

    const contentEl = document.getElementById('app-content');

    // 显示加载状态（仅对非首页显示轻量加载指示）
    if (Cache.loaded) {
      contentEl.innerHTML = `<div class="page-container page-fade-in"><div class="flex items-center gap-3 text-coffee-300 text-sm"><div class="w-4 h-4 border-2 border-cream-400 border-t-clay-500 rounded-full animate-spin"></div>加载中...</div></div>`;
    }

    try {
      // 从后端拉取最新数据（保证前后端同步）
      if (Cache.loaded) {
        await Cache.refreshAll();
      }
      // 渲染页面内容
      contentEl.innerHTML = route.render();

      // 绑定页面内事件
      if (route.postRender) {
        route.postRender();
      }

      // 更新导航激活状态
      this.updateNavActive();

      // 滚动到顶部
      window.scrollTo(0, 0);
    } catch (e) {
      console.error('导航失败:', e);
      contentEl.innerHTML = `
        <div class="page-container">
          <div class="card p-8 text-center max-w-md mx-auto mt-20">
            <svg class="w-12 h-12 mx-auto mb-4 text-clay-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <h2 class="text-lg font-medium text-coffee-700 mb-2">数据加载失败</h2>
            <p class="text-sm text-coffee-400 mb-4">请确认后端服务已启动</p>
            <p class="text-xs text-coffee-300 mb-4">${e.message}</p>
            <button onclick="location.reload()" class="btn btn-primary">重试</button>
          </div>
        </div>
      `;
    } finally {
      this._navigating = false;
    }
  },

  // 更新导航栏激活状态
  updateNavActive() {
    document.querySelectorAll('#nav-links a[data-route]').forEach(link => {
      const route = link.getAttribute('data-route');
      if (route === this.currentRoute) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // 程序化跳转
  go(route) {
    window.location.hash = route;
  }
};
