/**
 * pages.js - 页面渲染层
 * 9 个导航页面的完整渲染函数，返回 HTML 字符串
 */

// ==================== 1. 首页 ====================
function renderHome() {
  const todayTotal = Records.getTodayTotal();
  const weekTotal = Records.getWeekTotal();
  const monthTotal = Records.getMonthTotal();
  const streak = Records.getStreak();
  const goal = Settings.getDailyGoal();
  const progress = Math.min((todayTotal / goal) * 100, 100);
  const todayRecords = Records.getByDate(getTodayString());
  const pendingTasks = Tasks.getPending();
  const recentRecords = Records.getAll().slice(0, 5);
  const recentNotes = Notes.getAll().slice(0, 3);
  const weekDays = ['周一','周二','周三','周四','周五','周六','周日'];
  const now = new Date();
  const todayDow = now.getDay() || 7; // 1=周一...7=周日

  // === 本周每日学习时长迷你柱状图 ===
  const weeklyDailyStats = Records.getDailyStats(7);
  // getDailyStats 返回的是最近7天（含今天），需要重新计算本周一到周日的数据
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayDow + 1);
  const weekBarData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = Records.getByDate(dateStr).reduce((s, r) => s + r.duration, 0);
    weekBarData.push({ date: dateStr, duration: dayTotal, dayName: weekDays[i] });
  }
  const maxWeekBar = Math.max(...weekBarData.map(d => d.duration), 1);

  // === 今日分类分布 ===
  const todayCategoryMap = {};
  todayRecords.forEach(r => {
    todayCategoryMap[r.category] = (todayCategoryMap[r.category] || 0) + r.duration;
  });
  const todayCategoryEntries = Object.entries(todayCategoryMap).sort((a, b) => b[1] - a[1]);
  const todayCategoryMax = todayCategoryEntries.length > 0 ? todayCategoryEntries[0][1] : 1;

  // === 学习洞察 ===
  const insights = [];
  const weekCatStats = {};
  weekBarData.forEach(d => {
    if (d.duration > 0) {
      Records.getByDate(d.date).forEach(r => {
        weekCatStats[r.category] = (weekCatStats[r.category] || 0) + r.duration;
      });
    }
  });
  const weekCatEntries = Object.entries(weekCatStats).sort((a, b) => b[1] - a[1]);
  if (weekCatEntries.length > 0) {
    const topCat = weekCatEntries[0];
    const pct = Math.round((topCat[1] / weekTotal) * 100);
    insights.push(`本周「${topCat[0]}」学习最多，占比 ${pct}%`);
  }
  if (streak > 0) {
    insights.push(`连续打卡 ${streak} 天，继续保持`);
  }
  const weekActiveDays = weekBarData.filter(d => d.duration > 0).length;
  if (weekActiveDays > 0) {
    insights.push(`本周已学习 ${weekActiveDays} 天，活跃度 ${Math.round((weekActiveDays / 7) * 100)}%`);
  }
  if (todayTotal === 0) {
    insights.push('今日暂无学习记录，开始新的一天吧');
  }
  if (todayTotal >= goal) {
    insights.push('恭喜，今日目标已达成！');
  } else if (todayTotal > 0) {
    insights.push(`今日已完成 ${Math.round(progress)}%，加油冲刺`);
  }
  // 取前3条
  const displayInsights = insights.slice(0, 3);

  return `
    <div class="page-container page-fade-in">
      <!-- 欢迎区 -->
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">今日概览</h1>
        <p class="text-sm text-coffee-300 mt-1">${getTodayString()} · ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-5">
          <div class="stat-label">今日学习</div>
          <div class="stat-number">${formatDuration(todayTotal)}</div>
          <div class="mt-3">
            <div class="progress-bar">
              <div class="progress-bar-fill bg-mist-400" style="width:${progress}%"></div>
            </div>
            <div class="text-[11px] text-coffee-300 mt-1.5">目标 ${goal} 分钟 · ${Math.round(progress)}%</div>
          </div>
        </div>
        <div class="card p-5">
          <div class="stat-label">本周累计</div>
          <div class="stat-number">${formatDuration(weekTotal)}</div>
          <div class="text-[11px] text-coffee-300 mt-1.5">${Math.round(weekTotal / 7)} 分钟/天 平均</div>
        </div>
        <div class="card p-5">
          <div class="stat-label">本月累计</div>
          <div class="stat-number">${formatDuration(monthTotal)}</div>
          <div class="text-[11px] text-coffee-300 mt-1.5">${new Date().getMonth() + 1}月</div>
        </div>
        <div class="card p-5">
          <div class="stat-label">连续打卡</div>
          <div class="stat-number">${streak}<span class="text-base ml-1">天</span></div>
          <div class="text-[11px] text-coffee-300 mt-1.5">保持学习节奏</div>
        </div>
      </div>

      <!-- 本周每日学习时长迷你柱状图 -->
      <div class="card p-5 mb-8">
        <h2 class="text-sm font-medium text-coffee-700 mb-4">本周每日学习时长</h2>
        <div class="flex items-end gap-3 h-32">
          ${weekBarData.map((d, i) => {
            const height = maxWeekBar > 0 ? (d.duration / maxWeekBar) * 100 : 0;
            const isToday = d.date === getTodayString();
            return `
              <div class="flex-1 flex flex-col items-center gap-1.5 group">
                <div class="text-[10px] text-coffee-300 opacity-0 group-hover:opacity-100 transition-opacity">${d.duration > 0 ? formatDuration(d.duration) : '-'}</div>
                <div class="w-full rounded-t-sm ${isToday ? 'bg-mist-400' : (d.duration > 0 ? 'bg-mist-300/60' : 'bg-cream-200')} transition-all" style="height:${Math.max(height, 4)}%"></div>
                <div class="text-[10px] ${isToday ? 'text-mist-500 font-medium' : 'text-coffee-300'}">${d.dayName}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：今日记录 + 待办 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 快捷录入 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">快速记录</h2>
            <form id="quick-record-form" class="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input type="text" name="subject" placeholder="学习内容" class="input-field md:col-span-2" required>
              <select name="category" class="input-field">
                ${Settings.getCategories().map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
              <input type="number" name="duration" placeholder="分钟" class="input-field" min="1" required>
              <button type="submit" class="btn btn-primary">记录</button>
            </form>
          </div>

          <!-- 今日记录列表 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">今日学习记录</h2>
              <a href="#today" class="text-xs text-mist-500 hover:text-mist-400">查看全部 →</a>
            </div>
            ${todayRecords.length === 0 ? `
              <div class="empty-state">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
                <p class="text-sm">今日暂无学习记录</p>
              </div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${todayRecords.map(r => `
                  <div class="list-item flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="tag tag-cafe">${r.category}</span>
                      <span class="text-sm text-coffee-700">${r.subject}</span>
                    </div>
                    <span class="text-xs text-coffee-300">${formatDuration(r.duration)}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- 最近学习 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">最近记录</h2>
            </div>
            <div class="divide-y divide-cream-200">
              ${recentRecords.map(r => `
                <div class="list-item flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="tag tag-warm">${r.date.slice(5)}</span>
                    <span class="tag tag-mist">${r.category}</span>
                    <span class="text-sm text-coffee-700">${r.subject}</span>
                  </div>
                  <span class="text-xs text-coffee-300">${formatDuration(r.duration)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 最近笔记预览区 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">最近笔记</h2>
              <a href="#notes" class="text-xs text-mist-500 hover:text-mist-400">查看全部 →</a>
            </div>
            ${recentNotes.length === 0 ? `
              <div class="p-5 text-center text-sm text-coffee-300">暂无笔记</div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${recentNotes.map(n => `
                  <div class="list-item">
                    <div class="flex items-start justify-between">
                      <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-medium text-coffee-700 mb-1">${n.title}</h3>
                        <p class="text-xs text-coffee-300 line-clamp-2">${n.content}</p>
                        <div class="flex items-center gap-2 mt-2">
                          ${n.tags.map(t => `<span class="tag tag-warm">${t}</span>`).join('')}
                          <span class="text-[11px] text-coffee-300">${new Date(n.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- 右侧：分类分布 + 待办 + 快捷入口 + 学习洞察 -->
        <div class="space-y-6">
          <!-- 今日分类分布 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">今日分类分布</h2>
            ${todayCategoryEntries.length === 0 ? `
              <div class="text-center text-sm text-coffee-300 py-3">今日暂无数据</div>
            ` : `
              <div class="space-y-3">
                ${todayCategoryEntries.map(([cat, dur]) => {
                  const pct = Math.round((dur / todayTotal) * 100);
                  const barWidth = Math.round((dur / todayCategoryMax) * 100);
                  return `
                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-coffee-500">${cat}</span>
                        <span class="text-coffee-300">${formatDuration(dur)} (${pct}%)</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-bar-fill bg-mist-400" style="width:${barWidth}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- 待办任务 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">待办任务</h2>
              <a href="#tasks" class="text-xs text-mist-500 hover:text-mist-400">管理 →</a>
            </div>
            ${pendingTasks.length === 0 ? `
              <div class="p-5 text-center text-sm text-coffee-300">暂无待办任务</div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${pendingTasks.slice(0, 5).map(t => `
                  <div class="list-item flex items-center gap-3">
                    <div class="custom-checkbox ${t.completed ? 'checked' : ''}" onclick="Tasks.toggleComplete('${t.id}'); Router.navigate();"></div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm text-coffee-700 truncate">${t.title}</div>
                      <div class="text-[11px] text-coffee-300 mt-0.5">${t.dueDate === getTodayString() ? '今天' : t.dueDate}</div>
                    </div>
                    <span class="priority-${t.priority} text-[11px]">${{high:'高',medium:'中',low:'低'}[t.priority]}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- 学习洞察 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">学习洞察</h2>
            <div class="space-y-3">
              ${displayInsights.map(ins => `
                <div class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-mist-400 mt-1.5 shrink-0"></span>
                  <span class="text-xs text-coffee-500 leading-relaxed">${ins}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 快捷入口 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">快捷入口</h2>
            <div class="grid grid-cols-2 gap-2">
              <a href="#today" class="flex items-center gap-2 p-3 rounded-lg bg-cream-50 hover:bg-cream-200 transition-colors text-sm text-coffee-500">
                <svg class="w-4 h-4 text-mist-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                记录学习
              </a>
              <a href="#notes" class="flex items-center gap-2 p-3 rounded-lg bg-cream-50 hover:bg-cream-200 transition-colors text-sm text-coffee-500">
                <svg class="w-4 h-4 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                写笔记
              </a>
              <a href="#tasks" class="flex items-center gap-2 p-3 rounded-lg bg-cream-50 hover:bg-cream-200 transition-colors text-sm text-coffee-500">
                <svg class="w-4 h-4 text-mist-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                添加任务
              </a>
              <a href="#calendar" class="flex items-center gap-2 p-3 rounded-lg bg-cream-50 hover:bg-cream-200 transition-colors text-sm text-coffee-500">
                <svg class="w-4 h-4 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                查看日历
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==================== 2. 今日学习 ====================
function renderToday() {
  const today = getTodayString();
  const records = Records.getByDate(today);
  const total = Records.getTodayTotal();
  const goal = Settings.getDailyGoal();
  const progress = Math.min((total / goal) * 100, 100);
  const categories = Settings.getCategories();

  // === 今日分类时长分布 ===
  const todayCatMap = {};
  records.forEach(r => {
    todayCatMap[r.category] = (todayCatMap[r.category] || 0) + r.duration;
  });
  const todayCatEntries = Object.entries(todayCatMap).sort((a, b) => b[1] - a[1]);
  const todayCatMax = todayCatEntries.length > 0 ? todayCatEntries[0][1] : 1;

  // === 今日时间线（按时段分组） ===
  const timeSlots = [
    { label: '清晨 (00:00 - 06:00)', filter: r => { const h = parseInt((r.startTime || '12:00').split(':')[0]); return h >= 0 && h < 6; } },
    { label: '上午 (06:00 - 12:00)', filter: r => { const h = parseInt((r.startTime || '12:00').split(':')[0]); return h >= 6 && h < 12; } },
    { label: '下午 (12:00 - 18:00)', filter: r => { const h = parseInt((r.startTime || '12:00').split(':')[0]); return h >= 12 && h < 18; } },
    { label: '晚间 (18:00 - 24:00)', filter: r => { const h = parseInt((r.startTime || '12:00').split(':')[0]); return h >= 18 && h < 24; } }
  ];
  const timelineGroups = timeSlots.map(slot => {
    const slotRecords = records.filter(slot.filter);
    return { ...slot, records: slotRecords, total: slotRecords.reduce((s, r) => s + r.duration, 0) };
  }).filter(g => g.records.length > 0);

  // === 今日任务 ===
  const todayTasks = Tasks.getTodayTasks();

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">今日学习</h1>
        <p class="text-sm text-coffee-300 mt-1">${today} · 记录每一刻进步</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：录入表单 + 统计 -->
        <div class="space-y-6">
          <!-- 录入表单 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">添加学习记录</h2>
            <form id="today-record-form" class="space-y-3">
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">学习内容</label>
                <input type="text" name="subject" placeholder="例如：JavaScript 闭包学习" class="input-field" required>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-coffee-300 mb-1.5">分类</label>
                  <select name="category" class="input-field">
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-coffee-300 mb-1.5">时长（分钟）</label>
                  <input type="number" name="duration" placeholder="60" class="input-field" min="1" required>
                </div>
              </div>
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">详细内容</label>
                <textarea name="content" rows="3" placeholder="记录学习要点、心得..." class="input-field resize-none"></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-full">添加记录</button>
            </form>
          </div>

          <!-- 今日统计 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">今日统计</h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs text-coffee-300 mb-1.5">
                  <span>目标进度</span>
                  <span>${total}/${goal} 分钟</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill bg-mist-400" style="width:${progress}%"></div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div class="text-center p-3 bg-cream-50 rounded-lg">
                  <div class="stat-number text-lg">${records.length}</div>
                  <div class="stat-label">记录条数</div>
                </div>
                <div class="text-center p-3 bg-cream-50 rounded-lg">
                  <div class="stat-number text-lg">${formatDuration(total)}</div>
                  <div class="stat-label">总时长</div>
                </div>
              </div>
              <!-- 今日分类时长分布 -->
              ${todayCatEntries.length > 0 ? `
                <div class="divider" style="margin:12px 0"></div>
                <div class="text-xs text-coffee-300 mb-2">分类时长分布</div>
                <div class="space-y-2.5">
                  ${todayCatEntries.map(([cat, dur]) => {
                    const pct = Math.round((dur / total) * 100);
                    const barWidth = Math.round((dur / todayCatMax) * 100);
                    return `
                      <div>
                        <div class="flex justify-between text-[11px] mb-1">
                          <span class="text-coffee-500">${cat}</span>
                          <span class="text-coffee-300">${formatDuration(dur)} (${pct}%)</span>
                        </div>
                        <div class="progress-bar">
                          <div class="progress-bar-fill bg-coffee-300" style="width:${barWidth}%"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- 右侧：时间线 + 记录列表 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 今日时间线视图 -->
          ${timelineGroups.length > 0 ? `
            <div class="card">
              <div class="flex items-center justify-between p-5 border-b border-cream-400">
                <h2 class="text-sm font-medium text-coffee-700">今日时间线</h2>
                <span class="text-xs text-coffee-300">${records.length} 条记录</span>
              </div>
              <div class="p-5 space-y-4">
                ${timelineGroups.map(group => `
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span class="w-2 h-2 rounded-full bg-mist-400"></span>
                      <span class="text-xs font-medium text-coffee-500">${group.label}</span>
                      <span class="text-[11px] text-coffee-300">${formatDuration(group.total)}</span>
                    </div>
                    <div class="ml-4 pl-3 border-l-2 border-cream-400 space-y-2">
                      ${group.records.map(r => `
                        <div class="flex items-center gap-2 text-xs">
                          <span class="tag tag-cafe">${r.category}</span>
                          <span class="text-coffee-700">${r.subject}</span>
                          <span class="text-coffee-300 ml-auto">${formatDuration(r.duration)}</span>
                        </div>
                        ${r.content ? `<p class="text-[11px] text-coffee-300 ml-1 line-clamp-1 mt-0.5">${r.content}</p>` : ''}
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 今日记录明细 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">今日记录明细</h2>
              <span class="text-xs text-coffee-300">共 ${records.length} 条</span>
            </div>
            ${records.length === 0 ? `
              <div class="empty-state">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p class="text-sm">今日还没有学习记录</p>
                <p class="text-xs mt-1">在左侧表单中添加你的第一条记录</p>
              </div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${records.map(r => `
                  <div class="list-item group">
                    <div class="flex items-start justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="tag tag-cafe">${r.category}</span>
                          <span class="text-sm font-medium text-coffee-700">${r.subject}</span>
                        </div>
                        ${r.content ? `<p class="text-xs text-coffee-300 mt-1 line-clamp-2">${r.content}</p>` : ''}
                      </div>
                      <div class="flex items-center gap-3 ml-4 shrink-0">
                        <span class="text-xs text-coffee-300">${formatDuration(r.duration)}</span>
                        <div class="flex items-center gap-1">
                          <button onclick="editRecord('${r.id}')" class="opacity-0 group-hover:opacity-100 text-coffee-300 hover:text-clay-500 transition-opacity" title="编辑">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                          </button>
                          <button onclick="deleteRecord('${r.id}')" class="opacity-0 group-hover:opacity-100 text-coffee-300 hover:text-red-400 transition-opacity" title="删除">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- 今日随笔快捷入口 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-3">今日随笔</h2>
            <p class="text-xs text-coffee-300 mb-3">快速记录此刻的想法，保存为随笔笔记</p>
            <textarea id="quick-thought" rows="3" placeholder="此刻的想法..." class="input-field resize-none mb-3"></textarea>
            <button onclick="saveQuickThought()" class="btn btn-secondary">保存随笔</button>
          </div>

          <!-- 今日任务内嵌列表 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">今日任务</h2>
              <a href="#tasks" class="text-xs text-mist-500 hover:text-mist-400">管理 →</a>
            </div>
            ${todayTasks.length === 0 ? `
              <div class="p-5 text-center text-sm text-coffee-300">今日暂无任务</div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${todayTasks.map(t => `
                  <div class="list-item flex items-center gap-3">
                    <div class="custom-checkbox ${t.completed ? 'checked' : ''}" onclick="Tasks.toggleComplete('${t.id}'); Router.navigate();"></div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm ${t.completed ? 'line-through text-coffee-300' : 'text-coffee-700'} truncate">${t.title}</div>
                      ${t.description ? `<div class="text-[11px] text-coffee-300 mt-0.5">${t.description}</div>` : ''}
                    </div>
                    <span class="priority-${t.priority} text-[11px]">${{high:'高',medium:'中',low:'低'}[t.priority]}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 保存快速随笔为笔记
function saveQuickThought() {
  const textarea = document.getElementById('quick-thought');
  if (!textarea) return;
  const content = textarea.value.trim();
  if (!content) return;
  Notes.create({
    title: `随笔 · ${getTodayString()}`,
    content: content,
    tags: ['随笔']
  });
  Router.navigate();
}

// ==================== 3. 日历档案 ====================
function renderCalendar() {
  // 读取当前日历月份变量，支持月份切换
  if (window.currentCalendarYear === undefined || window.currentCalendarMonth === undefined) {
    const now = new Date();
    window.currentCalendarYear = now.getFullYear();
    window.currentCalendarMonth = now.getMonth(); // 0-based
  }
  const year = window.currentCalendarYear;
  const month = window.currentCalendarMonth;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay() || 7; // 周一为1

  const allRecords = Records.getAll();
  const recordsByDate = {};
  allRecords.forEach(r => {
    recordsByDate[r.date] = (recordsByDate[r.date] || 0) + r.duration;
  });

  // 当月每条记录（用于分类统计）
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthRecords = allRecords.filter(r => r.date.startsWith(monthStr));

  const today = getTodayString();

  // 本月概览数据
  const monthDaysWithRecords = Object.keys(recordsByDate).filter(d => d.startsWith(monthStr));
  const monthTotalDuration = monthDaysWithRecords.reduce((s, d) => s + recordsByDate[d], 0);
  const monthDailyAvg = monthDaysWithRecords.length > 0 ? Math.round(monthTotalDuration / monthDaysWithRecords.length) : 0;
  const monthMaxDay = monthDaysWithRecords.length > 0 ? Math.max(...monthDaysWithRecords.map(d => recordsByDate[d])) : 0;

  // 学习率：有记录天数 / 当月已过天数
  const daysPassed = Math.min(new Date().getDate(), daysInMonth);
  const isCurrentMonth = (year === new Date().getFullYear() && month === new Date().getMonth());
  const effectiveDaysPassed = isCurrentMonth ? daysPassed : daysInMonth;
  const studyRate = effectiveDaysPassed > 0 ? Math.round((monthDaysWithRecords.length / effectiveDaysPassed) * 100) : 0;

  // 最活跃科目
  const monthCatMap = {};
  monthRecords.forEach(r => {
    monthCatMap[r.category] = (monthCatMap[r.category] || 0) + r.duration;
  });
  const monthCatEntries = Object.entries(monthCatMap).sort((a, b) => b[1] - a[1]);
  const topCategory = monthCatEntries.length > 0 ? monthCatEntries[0][0] : '-';

  // 本月分类时长排行 (Top 5)
  const topCats = monthCatEntries.slice(0, 5);
  const topCatMax = topCats.length > 0 ? topCats[0][1] : 1;

  // 生成日历格子
  let calendarHTML = '';
  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  // 星期标题
  weekdays.forEach(wd => {
    calendarHTML += `<div class="bg-cream-50 p-2 text-center text-xs text-coffee-300 font-medium">${wd}</div>`;
  });

  // 上月填充
  for (let i = 1; i < startWeekday; i++) {
    calendarHTML += `<div class="calendar-cell other-month"><div class="day-number">${new Date(year, month, 1 - (startWeekday - i)).getDate()}</div></div>`;
  }

  // 当月
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    const duration = recordsByDate[dateStr] || 0;
    const isToday = dateStr === today;
    const hasRecord = duration > 0;

    calendarHTML += `
      <div class="calendar-cell ${isToday ? 'today' : ''}" onclick="showDayDetail('${dateStr}')">
        <div class="day-number">${day}</div>
        ${hasRecord ? `
          <div class="mt-1">
            <span class="text-[10px] text-mist-500">${formatDuration(duration)}</span>
            <div class="flex gap-0.5 mt-1">
              <span class="dot bg-mist-400"></span>
              ${duration >= 60 ? '<span class="dot bg-coffee-300"></span>' : ''}
              ${duration >= 120 ? '<span class="dot bg-coffee-300"></span>' : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 下月填充
  const totalCells = startWeekday - 1 + daysInMonth;
  const remaining = 42 - totalCells;
  for (let i = 1; i <= remaining; i++) {
    calendarHTML += `<div class="calendar-cell other-month"><div class="day-number">${i}</div></div>`;
  }

  // 本月学习热力摘要（一行小色块）
  let heatmapHTML = '';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    const dur = recordsByDate[dateStr] || 0;
    let bgColor = '#f0eeea'; // 无记录
    if (dur > 0 && dur < 60) bgColor = '#d4e0ec';
    if (dur >= 60 && dur < 120) bgColor = '#a8b5c4';
    if (dur >= 120) bgColor = '#8fa3b8';
    heatmapHTML += `<div class="heatmap-block" style="background:${bgColor}" title="${dateStr}: ${formatDuration(dur)}"></div>`;
  }

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">日历档案</h1>
        <p class="text-sm text-coffee-300 mt-1">${year}年${month + 1}月 · 点击日期查看详情</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 日历 -->
        <div class="lg:col-span-2">
          <div class="card p-5">
            <!-- 月份切换按钮 -->
            <div class="flex items-center justify-between mb-5">
              <button onclick="calendarPrevMonth()" class="btn btn-outline text-xs py-1.5 px-3">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
                上一月
              </button>
              <span class="text-sm font-medium text-coffee-700">${year}年${month + 1}月</span>
              <button onclick="calendarNextMonth()" class="btn btn-outline text-xs py-1.5 px-3">
                下一月
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
              </button>
            </div>

            <div class="calendar-grid">
              ${calendarHTML}
            </div>
            <div class="flex items-center gap-4 mt-4 text-xs text-coffee-300">
              <div class="flex items-center gap-1.5"><span class="dot bg-mist-400"></span> 有记录</div>
              <div class="flex items-center gap-1.5"><span class="dot bg-coffee-300"></span> 1小时+</div>
              <div class="flex items-center gap-1.5"><span class="dot bg-coffee-300"></span> 2小时+</div>
              <div class="flex-1"></div>
              <div class="px-2 py-0.5 bg-mist-300/20 text-mist-500 rounded text-[11px]">蓝色背景 = 今天</div>
            </div>
          </div>
        </div>

        <!-- 右侧：本月概览 -->
        <div class="space-y-6">
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">本月概览</h2>
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-cream-200">
                <span class="text-xs text-coffee-300">学习天数</span>
                <span class="text-sm font-medium text-coffee-700">${monthDaysWithRecords.length} 天</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-cream-200">
                <span class="text-xs text-coffee-300">总时长</span>
                <span class="text-sm font-medium text-coffee-700">${formatDuration(monthTotalDuration)}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-cream-200">
                <span class="text-xs text-coffee-300">日均时长</span>
                <span class="text-sm font-medium text-coffee-700">${formatDuration(monthDailyAvg)}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-cream-200">
                <span class="text-xs text-coffee-300">最长单次</span>
                <span class="text-sm font-medium text-coffee-700">${formatDuration(monthMaxDay)}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-cream-200">
                <span class="text-xs text-coffee-300">学习率</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-coffee-700">${studyRate}%</span>
                  <div class="w-16">
                    <div class="progress-bar">
                      <div class="progress-bar-fill bg-mist-400" style="width:${studyRate}%"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-xs text-coffee-300">最活跃科目</span>
                <span class="text-sm font-medium text-coffee-700">${topCategory}</span>
              </div>
            </div>
          </div>

          <!-- 本月分类时长排行 Top 5 -->
          ${topCats.length > 0 ? `
            <div class="card p-5">
              <h2 class="text-sm font-medium text-coffee-700 mb-4">分类时长排行</h2>
              <div class="space-y-3">
                ${topCats.map(([cat, dur], idx) => {
                  const barWidth = Math.round((dur / topCatMax) * 100);
                  return `
                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-coffee-500">${idx + 1}. ${cat}</span>
                        <span class="text-coffee-300">${formatDuration(dur)}</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-bar-fill ${idx === 0 ? 'bg-mist-400' : 'bg-coffee-300'}" style="width:${barWidth}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- 日期详情面板（动态更新） -->
          <div class="card p-5" id="day-detail-panel">
            <h2 class="text-sm font-medium text-coffee-700 mb-3">日期详情</h2>
            <p class="text-xs text-coffee-300">点击日历上的日期查看当日学习记录</p>
          </div>
        </div>
      </div>

      <!-- 本月学习热力摘要 -->
      <div class="card p-5 mt-6">
        <h2 class="text-sm font-medium text-coffee-700 mb-3">本月学习热力</h2>
        <div class="flex gap-1 flex-wrap" style="max-width:100%" id="heatmap-row">
          ${heatmapHTML}
        </div>
        <div class="flex items-center gap-4 mt-3 text-[11px] text-coffee-300">
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" style="background:#f0eeea"></span> 无记录</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" style="background:#d4e0ec"></span> &lt;1小时</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" style="background:#a8b5c4"></span> 1-2小时</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" style="background:#8fa3b8"></span> 2小时+</div>
        </div>
      </div>
    </div>
  `;
}

// 日历月份切换：上一月
function calendarPrevMonth() {
  if (window.currentCalendarMonth === undefined) {
    window.currentCalendarMonth = new Date().getMonth();
    window.currentCalendarYear = new Date().getFullYear();
  }
  window.currentCalendarMonth--;
  if (window.currentCalendarMonth < 0) {
    window.currentCalendarMonth = 11;
    window.currentCalendarYear--;
  }
  Router.navigate();
}

// 日历月份切换：下一月
function calendarNextMonth() {
  if (window.currentCalendarMonth === undefined) {
    window.currentCalendarMonth = new Date().getMonth();
    window.currentCalendarYear = new Date().getFullYear();
  }
  window.currentCalendarMonth++;
  if (window.currentCalendarMonth > 11) {
    window.currentCalendarMonth = 0;
    window.currentCalendarYear++;
  }
  Router.navigate();
}

// 日历点击显示日期详情
function showDayDetail(dateStr) {
  const records = Records.getByDate(dateStr);
  const panel = document.getElementById('day-detail-panel');
  if (!panel) return;

  const total = records.reduce((s, r) => s + r.duration, 0);

  // 当日分类统计
  const dayCatMap = {};
  records.forEach(r => {
    dayCatMap[r.category] = (dayCatMap[r.category] || 0) + r.duration;
  });
  const dayCatEntries = Object.entries(dayCatMap).sort((a, b) => b[1] - a[1]);

  panel.innerHTML = `
    <h2 class="text-sm font-medium text-coffee-700 mb-3">${dateStr} · ${formatDate(dateStr)}</h2>
    ${records.length === 0 ? `
      <p class="text-xs text-coffee-300">当日无学习记录</p>
    ` : `
      <div class="text-xs text-coffee-300 mb-3">共 ${formatDuration(total)} · ${records.length} 条记录</div>
      <!-- 当日分类摘要 -->
      ${dayCatEntries.length > 1 ? `
        <div class="flex flex-wrap gap-2 mb-3">
          ${dayCatEntries.map(([cat, dur]) => `
            <span class="text-[11px] text-coffee-400">${cat}: ${formatDuration(dur)}</span>
          `).join('<span class="text-cream-300">|</span>')}
        </div>
      ` : ''}
      <div class="space-y-2">
        ${records.map(r => `
          <div class="p-2.5 bg-cream-50 rounded-md">
            <div class="flex items-center gap-2">
              <span class="tag tag-cafe">${r.category}</span>
              <span class="text-xs text-coffee-500">${r.subject}</span>
            </div>
            ${r.content ? `<p class="text-[11px] text-coffee-300 mt-1 line-clamp-2">${r.content}</p>` : ''}
            <div class="text-[11px] text-coffee-300 mt-1">${formatDuration(r.duration)}</div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// ==================== 4. 数据统计 ====================
function renderStats() {
  const dailyStats = Records.getDailyStats(14);
  const dailyStats30 = Records.getDailyStats(30);
  const categoryStats = Records.getCategoryStats();
  const allRecords = Records.getAll();
  const totalDuration = allRecords.reduce((s, r) => s + r.duration, 0);
  const totalRecords = allRecords.length;
  const uniqueDays = [...new Set(allRecords.map(r => r.date))].length;
  const avgDaily = Math.round(totalDuration / Math.max(uniqueDays, 1));
  const goal = Settings.getDailyGoal();

  const maxDaily = Math.max(...dailyStats.map(d => d.duration), 1);
  const maxDaily30 = Math.max(...dailyStats30.map(d => d.duration), 1);

  // === 本周 vs 上周对比 ===
  const now = new Date();
  const todayDow = now.getDay() || 7;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - todayDow + 1);
  const thisSunday = new Date(thisMonday);
  thisSunday.setDate(thisMonday.getDate() + 6);
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(thisMonday);
  lastSunday.setDate(thisMonday.getDate() - 1);

  const thisWeekStart = thisMonday.toISOString().split('T')[0];
  const thisWeekEnd = thisSunday.toISOString().split('T')[0];
  const lastWeekStart = lastMonday.toISOString().split('T')[0];
  const lastWeekEnd = lastSunday.toISOString().split('T')[0];

  const thisWeekRecords = Records.getByDateRange(thisWeekStart, thisWeekEnd);
  const lastWeekRecords = Records.getByDateRange(lastWeekStart, lastWeekEnd);
  const thisWeekTotal = thisWeekRecords.reduce((s, r) => s + r.duration, 0);
  const lastWeekTotal = lastWeekRecords.reduce((s, r) => s + r.duration, 0);
  const thisWeekDays = [...new Set(thisWeekRecords.map(r => r.date))].length;
  const lastWeekDays = [...new Set(lastWeekRecords.map(r => r.date))].length;
  const thisWeekAvg = thisWeekDays > 0 ? Math.round(thisWeekTotal / thisWeekDays) : 0;
  const lastWeekAvg = lastWeekDays > 0 ? Math.round(lastWeekTotal / lastWeekDays) : 0;

  // 环比变化
  const weekTotalChange = lastWeekTotal > 0 ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100) : (thisWeekTotal > 0 ? 100 : 0);
  const weekDaysChange = lastWeekDays > 0 ? Math.round(((thisWeekDays - lastWeekDays) / lastWeekDays) * 100) : (thisWeekDays > 0 ? 100 : 0);

  // === 目标达成率统计 ===
  function goalReachRate(days) {
    const stats = Records.getDailyStats(days);
    const reached = stats.filter(d => d.duration >= goal).length;
    return { reached, total: days, rate: Math.round((reached / days) * 100) };
  }
  const goal7 = goalReachRate(7);
  const goal14 = goalReachRate(14);
  const goal30 = goalReachRate(30);

  // === 学习记录最多的5天 ===
  const dailyDurationMap = {};
  allRecords.forEach(r => {
    dailyDurationMap[r.date] = (dailyDurationMap[r.date] || 0) + r.duration;
  });
  const top5Days = Object.entries(dailyDurationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const top5Max = top5Days.length > 0 ? top5Days[0][1] : 1;

  // === 各分类月度对比 ===
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
  const lastMonthEnd = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`;

  const thisMonthRecords = Records.getByDateRange(thisMonthStart, getTodayString());
  const lastMonthRecords = Records.getByDateRange(lastMonthStart, lastMonthEnd);

  const thisMonthCatMap = {};
  const lastMonthCatMap = {};
  thisMonthRecords.forEach(r => { thisMonthCatMap[r.category] = (thisMonthCatMap[r.category] || 0) + r.duration; });
  lastMonthRecords.forEach(r => { lastMonthCatMap[r.category] = (lastMonthCatMap[r.category] || 0) + r.duration; });
  const allCats = [...new Set([...Object.keys(thisMonthCatMap), ...Object.keys(lastMonthCatMap)])];

  // 计算饼图角度（使用 conic-gradient）
  const totalCat = categoryStats.reduce((s, c) => s + c.duration, 0);
  let currentAngle = 0;
  const pieSlices = categoryStats.map((cat, i) => {
    const angle = (cat.duration / totalCat) * 360;
    const colors = ['#8fa3b8', '#c4b5a0', '#a8b5c4', '#b8a88f', '#b0bec8', '#d4c9b8', '#a0a8b0'];
    const start = currentAngle;
    currentAngle += angle;
    return { ...cat, start, end: currentAngle, color: colors[i % colors.length] };
  });

  const pieGradient = pieSlices.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">数据统计</h1>
        <p class="text-sm text-coffee-300 mt-1">学习数据可视化分析</p>
      </div>

      <!-- 核心指标 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-5 text-center">
          <div class="stat-number">${formatDuration(totalDuration)}</div>
          <div class="stat-label">累计学习时长</div>
        </div>
        <div class="card p-5 text-center">
          <div class="stat-number">${totalRecords}</div>
          <div class="stat-label">学习记录总数</div>
        </div>
        <div class="card p-5 text-center">
          <div class="stat-number">${formatDuration(avgDaily)}</div>
          <div class="stat-label">日均学习时长</div>
        </div>
        <div class="card p-5 text-center">
          <div class="stat-number">${Records.getStreak()}</div>
          <div class="stat-label">连续打卡天数</div>
        </div>
      </div>

      <!-- 本周 vs 上周对比 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-coffee-700">本周</h2>
            <span class="text-[11px] text-coffee-300">${thisWeekStart.slice(5)} ~ ${thisWeekEnd.slice(5)}</span>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${formatDuration(thisWeekTotal)}</div>
              <div class="text-[11px] text-coffee-300 mt-1">总时长</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${thisWeekDays}</div>
              <div class="text-[11px] text-coffee-300 mt-1">天数</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${formatDuration(thisWeekAvg)}</div>
              <div class="text-[11px] text-coffee-300 mt-1">日均</div>
            </div>
          </div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-coffee-700">上周</h2>
            <span class="text-[11px] text-coffee-300">${lastWeekStart.slice(5)} ~ ${lastWeekEnd.slice(5)}</span>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${formatDuration(lastWeekTotal)}</div>
              <div class="text-[11px] text-coffee-300 mt-1">总时长</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${lastWeekDays}</div>
              <div class="text-[11px] text-coffee-300 mt-1">天数</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${formatDuration(lastWeekAvg)}</div>
              <div class="text-[11px] text-coffee-300 mt-1">日均</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 环比变化指示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="flex items-center gap-2 text-xs text-coffee-300">
          <span>总时长环比：</span>
          <span class="${weekTotalChange >= 0 ? 'text-mist-500' : 'text-coffee-400'}">${weekTotalChange >= 0 ? '+' : ''}${weekTotalChange}%</span>
          ${weekTotalChange >= 0
            ? '<svg class="w-3.5 h-3.5 text-mist-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/></svg>'
            : '<svg class="w-3.5 h-3.5 text-coffee-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"/></svg>'
          }
        </div>
        <div class="flex items-center gap-2 text-xs text-coffee-300">
          <span>学习天数环比：</span>
          <span class="${weekDaysChange >= 0 ? 'text-mist-500' : 'text-coffee-400'}">${weekDaysChange >= 0 ? '+' : ''}${weekDaysChange}%</span>
          ${weekDaysChange >= 0
            ? '<svg class="w-3.5 h-3.5 text-mist-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/></svg>'
            : '<svg class="w-3.5 h-3.5 text-coffee-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"/></svg>'
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 近14天趋势 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-5">近14天学习趋势</h2>
          <div class="flex items-end gap-1.5 h-48">
            ${dailyStats.map(d => {
              const height = maxDaily > 0 ? (d.duration / maxDaily) * 100 : 0;
              const isGoal = d.duration >= goal;
              return `
                <div class="flex-1 flex flex-col items-center gap-1.5 group">
                  <div class="text-[10px] text-coffee-300 opacity-0 group-hover:opacity-100 transition-opacity">${d.duration > 0 ? formatDuration(d.duration) : ''}</div>
                  <div class="w-full rounded-t-sm ${isGoal ? 'bg-mist-400' : 'bg-mist-300/50'} relative" style="height:${Math.max(height, 4)}%">
                    ${isGoal ? '<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mist-400"></div>' : ''}
                  </div>
                  <div class="text-[10px] text-coffee-300">${d.date.slice(8)}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="flex items-center gap-4 mt-4 text-xs text-coffee-300">
            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-mist-400"></span> 达标</div>
            <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-mist-300/50"></span> 未达标</div>
          </div>
        </div>

        <!-- 分类占比 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-5">分类占比</h2>
          <div class="flex items-center gap-8">
            <!-- 饼图 -->
            <div class="shrink-0">
              <div style="width:140px;height:140px;border-radius:50%;background:conic-gradient(${pieGradient});"></div>
            </div>
            <!-- 图例 -->
            <div class="flex-1 space-y-2.5">
              ${pieSlices.map(s => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-sm" style="background:${s.color}"></span>
                    <span class="text-xs text-coffee-500">${s.name}</span>
                  </div>
                  <div class="text-xs text-coffee-300">${formatDuration(s.duration)} · ${Math.round((s.duration / totalCat) * 100)}%</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- 30天学习趋势 -->
      <div class="card p-5 mb-6">
        <h2 class="text-sm font-medium text-coffee-700 mb-5">30天学习趋势</h2>
        <div class="flex items-end gap-1 h-40">
          ${dailyStats30.map(d => {
            const height = maxDaily30 > 0 ? (d.duration / maxDaily30) * 100 : 0;
            const isGoal = d.duration >= goal;
            return `
              <div class="flex-1 flex flex-col items-center gap-1 group">
                <div class="text-[9px] text-coffee-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">${d.duration > 0 ? formatDuration(d.duration) : ''}</div>
                <div class="w-full rounded-t-sm ${isGoal ? 'bg-mist-400' : 'bg-mist-300/40'}" style="height:${Math.max(height, 2)}%"></div>
                <div class="text-[8px] text-coffee-300">${d.date.slice(8)}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="flex items-center gap-4 mt-3 text-[11px] text-coffee-300">
          <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-mist-400"></span> 达标 (>=${goal}分钟)</div>
          <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-mist-300/40"></span> 未达标</div>
        </div>
      </div>

      <!-- 目标达成率 + 学习记录最多的5天 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 目标达成率 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">目标达成率</h2>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="text-coffee-500">近7天</span>
                <span class="text-coffee-300">${goal7.reached}/${goal7.total} 天达标 (${goal7.rate}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-mist-400" style="width:${goal7.rate}%"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="text-coffee-500">近14天</span>
                <span class="text-coffee-300">${goal14.reached}/${goal14.total} 天达标 (${goal14.rate}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-coffee-300" style="width:${goal14.rate}%"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="text-coffee-500">近30天</span>
                <span class="text-coffee-300">${goal30.reached}/${goal30.total} 天达标 (${goal30.rate}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-mist-300" style="width:${goal30.rate}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习记录最多的5天 -->
        <div class="card">
          <div class="p-5 border-b border-cream-400">
            <h2 class="text-sm font-medium text-coffee-700">学习记录最多的5天</h2>
          </div>
          ${top5Days.length === 0 ? `
            <div class="empty-state">
              <p class="text-sm">暂无数据</p>
            </div>
          ` : `
            <div class="divide-y divide-cream-200">
              ${top5Days.map(([date, dur], idx) => `
                <div class="list-item flex items-center gap-3">
                  <span class="text-xs font-medium text-coffee-300 w-4">${idx + 1}</span>
                  <div class="flex-1">
                    <div class="text-sm text-coffee-700">${date} · ${formatDate(date)}</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-20">
                      <div class="progress-bar">
                        <div class="progress-bar-fill bg-mist-400" style="width:${Math.round((dur / top5Max) * 100)}%"></div>
                      </div>
                    </div>
                    <span class="text-xs text-coffee-300 w-16 text-right">${formatDuration(dur)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- 各分类月度对比 -->
      <div class="card overflow-hidden mb-6">
        <div class="p-5 border-b border-cream-400">
          <h2 class="text-sm font-medium text-coffee-700">各分类月度对比</h2>
          <span class="text-[11px] text-coffee-300 ml-2">本月 vs 上月</span>
        </div>
        ${allCats.length === 0 ? `
          <div class="empty-state">
            <p class="text-sm">暂无数据</p>
          </div>
        ` : `
          <table class="data-table">
            <thead>
              <tr>
                <th>分类</th>
                <th>本月时长</th>
                <th>上月时长</th>
                <th>变化</th>
              </tr>
            </thead>
            <tbody>
              ${allCats.map(cat => {
                const thisDur = thisMonthCatMap[cat] || 0;
                const lastDur = lastMonthCatMap[cat] || 0;
                const change = lastDur > 0 ? Math.round(((thisDur - lastDur) / lastDur) * 100) : (thisDur > 0 ? 100 : 0);
                return `
                  <tr>
                    <td><span class="tag tag-cafe">${cat}</span></td>
                    <td>${formatDuration(thisDur)}</td>
                    <td>${formatDuration(lastDur)}</td>
                    <td class="${change >= 0 ? 'text-mist-500' : 'text-coffee-400'}">${change >= 0 ? '+' : ''}${change}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>

      <!-- 分类详细统计表 -->
      <div class="card overflow-hidden">
        <div class="p-5 border-b border-cream-400">
          <h2 class="text-sm font-medium text-coffee-700">分类详细统计</h2>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>分类</th>
              <th>总时长</th>
              <th>占比</th>
              <th>记录数</th>
              <th>平均时长</th>
            </tr>
          </thead>
          <tbody>
            ${categoryStats.map(cat => {
              const count = Records.getByCategory(cat.name).length;
              const avg = Math.round(cat.duration / Math.max(count, 1));
              return `
                <tr>
                  <td><span class="tag tag-cafe">${cat.name}</span></td>
                  <td>${formatDuration(cat.duration)}</td>
                  <td>${Math.round((cat.duration / totalCat) * 100)}%</td>
                  <td>${count} 条</td>
                  <td>${formatDuration(avg)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==================== 5. 笔记资料库 ====================
function renderNotes() {
  const notes = Notes.getAll();
  const tags = Notes.getAllTags();
  const activeTag = new URLSearchParams(window.location.search).get('tag') || '';
  const filteredNotes = activeTag ? Notes.getByTag(activeTag) : notes;

  // === 笔记统计卡片 ===
  const totalNotes = notes.length;
  const totalTags = tags.length;
  // 本周新增
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekNewCount = notes.filter(n => n.createdAt >= weekAgo.getTime()).length;
  // 平均内容长度
  const avgLen = totalNotes > 0 ? Math.round(notes.reduce((s, n) => s + n.content.length, 0) / totalNotes) : 0;

  // === 标签统计（每个标签的笔记数量） ===
  const tagCountMap = {};
  notes.forEach(n => {
    n.tags.forEach(t => {
      tagCountMap[t] = (tagCountMap[t] || 0) + 1;
    });
  });
  const tagCountEntries = Object.entries(tagCountMap).sort((a, b) => b[1] - a[1]);

  // === 笔记类型分布（按标签统计，Top 10） ===
  const top10Tags = tagCountEntries.slice(0, 10);
  const maxTagCount = top10Tags.length > 0 ? top10Tags[0][1] : 1;

  // 应用本地搜索过滤
  const searchKeyword = new URLSearchParams(window.location.search).get('q') || '';
  let displayNotes = filteredNotes;
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase();
    displayNotes = filteredNotes.filter(n =>
      n.title.toLowerCase().includes(kw) ||
      n.content.toLowerCase().includes(kw)
    );
  }

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-light text-coffee-700 tracking-tight">笔记资料库</h1>
            <p class="text-sm text-coffee-300 mt-1">共 ${notes.length} 条笔记 · 沉淀学习所得</p>
          </div>
        </div>
      </div>

      <!-- 笔记统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card p-4 text-center">
          <div class="stat-number text-xl">${totalNotes}</div>
          <div class="stat-label text-[11px]">总笔记数</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-number text-xl">${totalTags}</div>
          <div class="stat-label text-[11px]">总标签数</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-number text-xl">${weekNewCount}</div>
          <div class="stat-label text-[11px]">本周新增</div>
        </div>
        <div class="card p-4 text-center">
          <div class="stat-number text-xl">${avgLen}</div>
          <div class="stat-label text-[11px]">平均内容长度</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：录入 + 标签 -->
        <div class="space-y-6">
          <!-- 笔记录入 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">新建笔记</h2>
            <form id="note-form" class="space-y-3">
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">标题</label>
                <input type="text" name="title" placeholder="笔记标题" class="input-field" required>
              </div>
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">标签（逗号分隔）</label>
                <input type="text" name="tags" placeholder="编程, JavaScript" class="input-field">
              </div>
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">内容</label>
                <textarea name="content" rows="5" placeholder="记录你的学习笔记..." class="input-field resize-none" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-full">保存笔记</button>
            </form>
          </div>

          <!-- 标签筛选（带标签统计） -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-3">标签筛选</h2>
            <div class="flex flex-wrap gap-2">
              <button onclick="filterNotesByTag('')" class="tag ${activeTag === '' ? 'tag-mist' : 'tag-warm'} cursor-pointer">全部 (${totalNotes})</button>
              ${tags.map(t => `
                <button onclick="filterNotesByTag('${t}')" class="tag ${activeTag === t ? 'tag-mist' : 'tag-warm'} cursor-pointer">${t} (${tagCountMap[t] || 0})</button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 右侧：搜索 + 笔记列表 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 笔记搜索框 -->
          <div class="card p-4">
            <form id="notes-search-form" class="flex gap-3">
              <div class="relative flex-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
                <input type="text" name="q" value="${searchKeyword}" placeholder="搜索笔记标题或内容..." class="input-field pl-9">
              </div>
              <button type="submit" class="btn btn-secondary">搜索</button>
              ${searchKeyword ? `<button type="button" onclick="clearNotesSearch()" class="btn btn-outline text-xs">清除</button>` : ''}
            </form>
          </div>

          <!-- 笔记列表 -->
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">笔记列表</h2>
              <span class="text-xs text-coffee-300">${displayNotes.length} 条${searchKeyword ? ` · 搜索"${searchKeyword}"` : (activeTag ? ` · 标签: ${activeTag}` : '')}</span>
            </div>
            ${displayNotes.length === 0 ? `
              <div class="empty-state">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                <p class="text-sm">${searchKeyword ? '未找到匹配的笔记' : '暂无笔记'}</p>
              </div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${displayNotes.map(n => `
                  <div class="list-item group">
                    <div class="flex items-start justify-between">
                      <div class="flex-1 min-w-0">
                        <details class="w-full">
                          <summary class="cursor-pointer list-none flex items-center justify-between">
                            <h3 class="text-sm font-medium text-coffee-700 mb-1">${n.title}</h3>
                            <span class="text-[10px] text-coffee-300 shrink-0 ml-2 group-hover:text-coffee-500 transition-colors">展开</span>
                          </summary>
                          <div class="mt-2 text-xs text-coffee-500 leading-relaxed whitespace-pre-wrap">${n.content}</div>
                        </details>
                        <div class="flex items-center gap-2 mt-2">
                          ${n.tags.map(t => `<span class="tag tag-warm">${t}</span>`).join('')}
                          <span class="text-[11px] text-coffee-300">${new Date(n.createdAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 ml-3 shrink-0">
                        <button onclick="editNote('${n.id}')" class="opacity-0 group-hover:opacity-100 text-coffee-300 hover:text-clay-500 transition-opacity" title="编辑">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                        </button>
                        <button onclick="deleteNote('${n.id}')" class="opacity-0 group-hover:opacity-100 text-coffee-300 hover:text-red-400 transition-opacity" title="删除">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- 笔记类型分布统计 -->
          ${top10Tags.length > 0 ? `
            <div class="card p-5">
              <h2 class="text-sm font-medium text-coffee-700 mb-4">笔记类型分布</h2>
              <div class="space-y-2.5">
                ${top10Tags.map(([tag, count]) => {
                  const barWidth = Math.round((count / maxTagCount) * 100);
                  return `
                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-coffee-500">${tag}</span>
                        <span class="text-coffee-300">${count} 条</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-bar-fill bg-coffee-300" style="width:${barWidth}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function filterNotesByTag(tag) {
  const url = new URL(window.location.href);
  if (tag) url.searchParams.set('tag', tag);
  else url.searchParams.delete('tag');
  url.searchParams.delete('q'); // 切换标签时清除搜索
  window.history.replaceState({}, '', url.toString());
  Router.navigate();
}

// 清除笔记搜索
function clearNotesSearch() {
  const url = new URL(window.location.href);
  url.searchParams.delete('q');
  window.history.replaceState({}, '', url.toString());
  Router.navigate();
}

// ==================== 6. 检索查询 ====================
function renderSearch() {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get('q') || '';
  const type = params.get('type') || 'all';
  // 高级筛选参数
  const advDateStart = params.get('dateStart') || '';
  const advDateEnd = params.get('dateEnd') || '';
  const advCategory = params.get('category') || '';
  const advDurationMin = params.get('durationMin') || '';
  const advDurationMax = params.get('durationMax') || '';
  const showAdvanced = params.get('advanced') === '1';

  // 搜索历史
  const searchHistory = JSON.parse(localStorage.getItem('st_search_history') || '[]');

  // 热门搜索标签：从所有分类和笔记标签中提取
  const allCategories = Settings.getCategories();
  const allTags = Notes.getAllTags();
  const hotKeywords = [...new Set([...allCategories, ...allTags])].slice(0, 8);

  // 执行搜索（含高级筛选）
  let results = [];
  let recordCount = 0, noteCount = 0, taskCount = 0;
  if (keyword) {
    // 保存搜索历史
    const newHistory = [keyword, ...searchHistory.filter(k => k !== keyword)].slice(0, 5);
    localStorage.setItem('st_search_history', JSON.stringify(newHistory));

    if (type === 'all' || type === 'records') {
      let recs = Records.getAll().filter(r =>
        r.subject.includes(keyword) || (r.content && r.content.includes(keyword)) || r.category.includes(keyword)
      );
      // 高级筛选：日期范围
      if (advDateStart) recs = recs.filter(r => r.date >= advDateStart);
      if (advDateEnd) recs = recs.filter(r => r.date <= advDateEnd);
      // 高级筛选：分类
      if (advCategory) recs = recs.filter(r => r.category === advCategory);
      // 高级筛选：时长范围
      if (advDurationMin) recs = recs.filter(r => r.duration >= parseInt(advDurationMin));
      if (advDurationMax) recs = recs.filter(r => r.duration <= parseInt(advDurationMax));
      recordCount = recs.length;
      recs.forEach(r => results.push({ type: 'record', data: r }));
    }
    if (type === 'all' || type === 'notes') {
      let noteResults = Notes.search(keyword);
      // 高级筛选：日期范围（笔记用 updatedAt 或 createdAt）
      if (advDateStart) noteResults = noteResults.filter(n => (n.updatedAt || n.createdAt || '').slice(0, 10) >= advDateStart);
      if (advDateEnd) noteResults = noteResults.filter(n => (n.updatedAt || n.createdAt || '').slice(0, 10) <= advDateEnd);
      noteCount = noteResults.length;
      noteResults.forEach(n => results.push({ type: 'note', data: n }));
    }
    if (type === 'all' || type === 'tasks') {
      let taskResults = Tasks.getAll().filter(t =>
        t.title.includes(keyword) || (t.description && t.description.includes(keyword))
      );
      // 高级筛选：日期范围（任务用 dueDate）
      if (advDateStart) taskResults = taskResults.filter(t => t.dueDate >= advDateStart);
      if (advDateEnd) taskResults = taskResults.filter(t => t.dueDate <= advDateEnd);
      taskCount = taskResults.length;
      taskResults.forEach(t => results.push({ type: 'task', data: t }));
    }
  }

  // 搜索建议关键词
  const suggestionKeywords = hotKeywords.slice(0, 5);

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">检索查询</h1>
        <p class="text-sm text-coffee-300 mt-1">全局搜索学习记录、笔记和任务</p>
      </div>

      <!-- 搜索区 -->
      <div class="card p-5 mb-6">
        <form id="search-form" class="flex gap-3">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input type="text" name="q" value="${keyword}" placeholder="输入关键词搜索..." class="input-field pl-9" autofocus>
          </div>
          <select name="type" class="input-field w-32">
            <option value="all" ${type === 'all' ? 'selected' : ''}>全部</option>
            <option value="records" ${type === 'records' ? 'selected' : ''}>学习记录</option>
            <option value="notes" ${type === 'notes' ? 'selected' : ''}>笔记</option>
            <option value="tasks" ${type === 'tasks' ? 'selected' : ''}>任务</option>
          </select>
          <button type="submit" class="btn btn-primary">搜索</button>
          <button type="button" onclick="toggleAdvancedSearch()" class="btn btn-outline" id="advanced-toggle-btn">${showAdvanced ? '收起筛选' : '高级筛选'}</button>
        </form>

        <!-- 热门搜索标签 -->
        ${hotKeywords.length > 0 ? `
          <div class="mt-4 pt-3 border-t border-cream-200">
            <span class="text-[11px] text-coffee-300 mr-2">热门搜索</span>
            <div class="inline-flex flex-wrap gap-1.5">
              ${hotKeywords.map(k => `
                <button type="button" onclick="quickSearch('${k}')" class="px-2.5 py-1 bg-cream-50 hover:bg-cream-200 rounded-full text-xs text-coffee-500 transition-colors">${k}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 高级筛选面板 -->
        <div id="advanced-filter-panel" class="mt-4 ${showAdvanced ? '' : 'hidden'}" style="${showAdvanced ? '' : 'display:none'}">
          <div class="p-4 bg-cream-50 rounded-lg border border-cream-400">
            <div class="text-xs font-medium text-coffee-700 mb-3">高级筛选条件</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="block text-[11px] text-coffee-300 mb-1">开始日期</label>
                <input type="date" name="dateStart" value="${advDateStart}" class="input-field text-sm">
              </div>
              <div>
                <label class="block text-[11px] text-coffee-300 mb-1">结束日期</label>
                <input type="date" name="dateEnd" value="${advDateEnd}" class="input-field text-sm">
              </div>
              <div>
                <label class="block text-[11px] text-coffee-300 mb-1">分类筛选</label>
                <select name="category" class="input-field text-sm">
                  <option value="">全部分类</option>
                  ${Settings.getCategories().map(c => `<option value="${c}" ${advCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] text-coffee-300 mb-1">最短时长</label>
                  <input type="number" name="durationMin" value="${advDurationMin}" placeholder="分钟" min="0" class="input-field text-sm">
                </div>
                <div>
                  <label class="block text-[11px] text-coffee-300 mb-1">最长时长</label>
                  <input type="number" name="durationMax" value="${advDurationMax}" placeholder="分钟" min="0" class="input-field text-sm">
                </div>
              </div>
            </div>
            <div class="mt-3 flex gap-2">
              <button type="submit" class="btn btn-primary text-xs py-1.5">应用筛选并搜索</button>
              <button type="button" onclick="clearAdvancedFilters()" class="btn btn-outline text-xs py-1.5">清除筛选</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      ${keyword ? `
        <div class="card">
          <div class="flex items-center justify-between p-5 border-b border-cream-400">
            <h2 class="text-sm font-medium text-coffee-700">搜索结果</h2>
            <!-- 分类型统计汇总条 -->
            <div class="flex items-center gap-3 text-xs text-coffee-300">
              <span>学习记录 <strong class="text-coffee-500">${recordCount}</strong> 条</span>
              <span class="text-cream-300">/</span>
              <span>笔记 <strong class="text-coffee-500">${noteCount}</strong> 条</span>
              <span class="text-cream-300">/</span>
              <span>任务 <strong class="text-coffee-500">${taskCount}</strong> 条</span>
              <span class="text-cream-300">/</span>
              <span>共 <strong class="text-coffee-700">${results.length}</strong> 条</span>
            </div>
          </div>
          ${results.length === 0 ? `
            <div class="empty-state">
              <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
              <p class="text-sm">未找到匹配结果</p>
              <p class="text-xs mt-1">尝试更换关键词或调整筛选条件</p>
              <!-- 搜索建议 -->
              <div class="mt-4 pt-4 border-t border-cream-200">
                <p class="text-xs text-coffee-300 mb-2">试试搜索以下关键词：</p>
                <div class="flex flex-wrap justify-center gap-2">
                  ${suggestionKeywords.map(k => `
                    <button onclick="quickSearch('${k}')" class="px-3 py-1 bg-cream-50 hover:bg-cream-200 rounded-full text-xs text-mist-500 transition-colors">${k}</button>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : `
            <div class="divide-y divide-cream-200">
              ${results.map(item => {
                if (item.type === 'record') {
                  const r = item.data;
                  return `
                    <div class="list-item">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="tag tag-cafe">学习记录</span>
                        <span class="tag tag-mist">${r.category}</span>
                        <span class="text-[11px] text-coffee-300">${r.date}</span>
                      </div>
                      <div class="text-sm text-coffee-700">${r.subject}</div>
                      <div class="text-xs text-coffee-300 mt-1">${formatDuration(r.duration)} · ${r.content || '无详细内容'}</div>
                    </div>
                  `;
                } else if (item.type === 'note') {
                  const n = item.data;
                  return `
                    <div class="list-item">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="tag tag-mist">笔记</span>
                        ${n.tags.map(t => `<span class="tag tag-warm">${t}</span>`).join('')}
                      </div>
                      <div class="text-sm text-coffee-700">${n.title}</div>
                      <div class="text-xs text-coffee-300 mt-1 line-clamp-2">${n.content}</div>
                    </div>
                  `;
                } else {
                  const t = item.data;
                  return `
                    <div class="list-item">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="tag tag-warm">任务</span>
                        <span class="priority-${t.priority} text-[11px]">${{high:'高',medium:'中',low:'低'}[t.priority]}优先级</span>
                        <span class="text-[11px] text-coffee-300">${t.dueDate}</span>
                      </div>
                      <div class="text-sm text-coffee-700 ${t.completed ? 'line-through text-coffee-300' : ''}">${t.title}</div>
                      <div class="text-xs text-coffee-300 mt-1">${t.description || '无描述'}</div>
                    </div>
                  `;
                }
              }).join('')}
            </div>
          `}
        </div>
      ` : `
        <!-- 无搜索词时显示最近搜索记录 -->
        <div class="card p-8 text-center mb-6">
          <svg class="w-12 h-12 mx-auto mb-4 text-cream-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
          <p class="text-sm text-coffee-300">输入关键词开始搜索</p>
          <p class="text-xs text-coffee-300 mt-1">支持搜索学习记录、笔记和任务</p>
        </div>
        ${searchHistory.length > 0 ? `
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-medium text-coffee-700">最近搜索</h2>
              <button onclick="clearSearchHistory()" class="text-[11px] text-coffee-300 hover:text-red-400 transition-colors">清除历史</button>
            </div>
            <div class="flex flex-wrap gap-2">
              ${searchHistory.map(h => `
                <button onclick="quickSearch('${h}')" class="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-cream-200 rounded-md text-sm text-coffee-500 transition-colors">
                  <svg class="w-3 h-3 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  ${h}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      `}
    </div>
  `;
}

// 搜索辅助函数：快速搜索
function quickSearch(keyword) {
  const url = new URL(window.location.href);
  url.searchParams.set('q', keyword);
  url.searchParams.delete('page');
  window.history.replaceState({}, '', url.toString());
  Router.navigate();
}

// 切换高级筛选面板
function toggleAdvancedSearch() {
  const url = new URL(window.location.href);
  const panel = document.getElementById('advanced-filter-panel');
  const btn = document.getElementById('advanced-toggle-btn');
  if (panel && panel.style.display === 'none') {
    panel.style.display = '';
    panel.classList.remove('hidden');
    btn.textContent = '收起筛选';
    url.searchParams.set('advanced', '1');
  } else if (panel) {
    panel.style.display = 'none';
    btn.textContent = '高级筛选';
    url.searchParams.delete('advanced');
  }
  window.history.replaceState({}, '', url.toString());
}

// 清除高级筛选
function clearAdvancedFilters() {
  const url = new URL(window.location.href);
  url.searchParams.delete('dateStart');
  url.searchParams.delete('dateEnd');
  url.searchParams.delete('category');
  url.searchParams.delete('durationMin');
  url.searchParams.delete('durationMax');
  window.history.replaceState({}, '', url.toString());
  Router.navigate();
}

// 清除搜索历史
function clearSearchHistory() {
  localStorage.removeItem('st_search_history');
  Router.navigate();
}

// ==================== 7. 计划任务 ====================
function renderTasks() {
  const allTasks = Tasks.getAll();
  const pendingTasks = Tasks.getPending();
  const completedTasks = Tasks.getCompleted();
  const stats = Tasks.getStats();
  const params = new URLSearchParams(window.location.search);
  const filter = params.get('filter') || 'all';
  const priority = params.get('priority') || '';

  // 按状态筛选
  let displayTasks = allTasks;
  if (filter === 'pending') displayTasks = pendingTasks;
  if (filter === 'completed') displayTasks = completedTasks;

  // 按优先级筛选
  if (priority) {
    displayTasks = displayTasks.filter(t => t.priority === priority);
  }

  // 各优先级数量统计（基于全部任务）
  const highCount = allTasks.filter(t => t.priority === 'high').length;
  const mediumCount = allTasks.filter(t => t.priority === 'medium').length;
  const lowCount = allTasks.filter(t => t.priority === 'low').length;

  // 完成率
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  // 本周任务概览
  const today = new Date();
  const todayDow = today.getDay() || 7; // 1=周一...7=周日
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow + 1);
  const mondayStr = monday.toISOString().split('T')[0];
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sundayStr = sunday.toISOString().split('T')[0];
  const weekTasks = allTasks.filter(t => t.dueDate >= mondayStr && t.dueDate <= sundayStr);
  const weekCompleted = weekTasks.filter(t => t.completed).length;
  const weekRate = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  // 逾期任务（截止日期 < 今天 且未完成）
  const todayStr = getTodayString();
  const overdueTasks = allTasks.filter(t => !t.completed && t.dueDate < todayStr);

  // 按截止日期排序，优先显示未完成
  displayTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.dueDate || '').localeCompare(b.dueDate || '');
  });

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">计划任务</h1>
        <p class="text-sm text-coffee-300 mt-1">管理学习任务 · ${stats.completed}/${stats.total} 已完成</p>
      </div>

      <!-- 任务统计卡片行 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="stat-label">总任务数</div>
            <div class="stat-number text-lg">${stats.total}</div>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill bg-coffee-300" style="width:100%"></div>
          </div>
          <div class="text-[11px] text-coffee-300 mt-1.5">高 ${highCount} / 中 ${mediumCount} / 低 ${lowCount}</div>
        </div>
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="stat-label">已完成</div>
            <div class="stat-number text-lg text-mist-500">${stats.completed}</div>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill bg-mist-400" style="width:${completionRate}%"></div>
          </div>
          <div class="text-[11px] text-coffee-300 mt-1.5">完成率 ${completionRate}%</div>
        </div>
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="stat-label">待完成</div>
            <div class="stat-number text-lg text-coffee-400">${stats.pending}</div>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill bg-coffee-100" style="width:${pendingRate}%"></div>
          </div>
          <div class="text-[11px] text-coffee-300 mt-1.5">占比 ${pendingRate}%</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：录入 + 筛选 + 概览 -->
        <div class="space-y-6">
          <!-- 任务录入 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-4">添加任务</h2>
            <form id="task-form" class="space-y-3">
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">任务标题</label>
                <input type="text" name="title" placeholder="任务名称" class="input-field" required>
              </div>
              <div>
                <label class="block text-xs text-coffee-300 mb-1.5">描述</label>
                <input type="text" name="description" placeholder="任务描述（可选）" class="input-field">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-coffee-300 mb-1.5">优先级</label>
                  <select name="priority" class="input-field">
                    <option value="high">高</option>
                    <option value="medium" selected>中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-coffee-300 mb-1.5">截止日期</label>
                  <input type="date" name="dueDate" value="${todayStr}" class="input-field">
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-full">添加任务</button>
            </form>
          </div>

          <!-- 筛选 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-3">状态筛选</h2>
            <div class="space-y-1">
              <button onclick="filterTasks('all')" class="w-full text-left px-3 py-2 rounded-md text-sm ${filter === 'all' && !priority ? 'bg-cream-200 text-coffee-700' : 'text-coffee-300 hover:bg-cream-50'} transition-colors">
                全部任务 <span class="float-right text-xs">${stats.total}</span>
              </button>
              <button onclick="filterTasks('pending')" class="w-full text-left px-3 py-2 rounded-md text-sm ${filter === 'pending' && !priority ? 'bg-cream-200 text-coffee-700' : 'text-coffee-300 hover:bg-cream-50'} transition-colors">
                待完成 <span class="float-right text-xs">${stats.pending}</span>
              </button>
              <button onclick="filterTasks('completed')" class="w-full text-left px-3 py-2 rounded-md text-sm ${filter === 'completed' && !priority ? 'bg-cream-200 text-coffee-700' : 'text-coffee-300 hover:bg-cream-50'} transition-colors">
                已完成 <span class="float-right text-xs">${stats.completed}</span>
              </button>
            </div>
            <div class="divider" style="margin:10px 0"></div>
            <h3 class="text-xs font-medium text-coffee-700 mb-2">优先级筛选</h3>
            <div class="space-y-1">
              <button onclick="filterByPriority('high')" class="w-full text-left px-3 py-2 rounded-md text-sm ${priority === 'high' ? 'bg-cream-200 text-coffee-700' : 'text-coffee-300 hover:bg-cream-50'} transition-colors">
                <span class="inline-block w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
                高优先级 <span class="float-right text-xs">${highCount}</span>
              </button>
              <button onclick="filterByPriority('medium')" class="w-full text-left px-3 py-2 rounded-md text-sm ${priority === 'medium' ? 'bg-cream-200 text-coffee-700' : 'text-coffee-300 hover:bg-cream-50'} transition-colors">
                <span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
                中优先级 <span class="float-right text-xs">${mediumCount}</span>
              </button>
              <button onclick="filterByPriority('low')" class="w-full text-left px-3 py-2 rounded-md text-sm ${priority === 'low' ? 'bg-cream-200 text-coffee-700' : 'text-coffee-300 hover:bg-cream-50'} transition-colors">
                <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1.5"></span>
                低优先级 <span class="float-right text-xs">${lowCount}</span>
              </button>
            </div>
          </div>

          <!-- 本周任务概览 -->
          <div class="card p-5">
            <h2 class="text-sm font-medium text-coffee-700 mb-3">本周任务概览</h2>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div class="text-center p-3 bg-cream-50 rounded-lg">
                <div class="text-lg font-light text-coffee-700">${weekTasks.length}</div>
                <div class="text-[11px] text-coffee-300">本周任务</div>
              </div>
              <div class="text-center p-3 bg-cream-50 rounded-lg">
                <div class="text-lg font-light text-mist-500">${weekCompleted}</div>
                <div class="text-[11px] text-coffee-300">已完成</div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-[11px] text-coffee-300 mb-1">
                <span>完成进度</span>
                <span>${weekRate}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-mist-400" style="width:${weekRate}%"></div>
              </div>
            </div>
            <div class="text-[11px] text-coffee-300 mt-2">${mondayStr.slice(5)} ~ ${sundayStr.slice(5)}</div>
          </div>

          <!-- 逾期任务提醒 -->
          ${overdueTasks.length > 0 ? `
            <div class="card p-5 border-l-2 border-l-red-400">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                <h2 class="text-sm font-medium text-red-500">逾期任务 (${overdueTasks.length})</h2>
              </div>
              <div class="space-y-2">
                ${overdueTasks.slice(0, 5).map(t => `
                  <div class="flex items-center justify-between py-1.5 px-2 bg-red-50 rounded text-sm">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="priority-${t.priority} text-[11px] shrink-0">${{high:'高',medium:'中',low:'低'}[t.priority]}</span>
                      <span class="text-coffee-700 truncate">${t.title}</span>
                    </div>
                    <span class="text-[11px] text-red-400 shrink-0 ml-2">截止 ${t.dueDate.slice(5)}</span>
                  </div>
                `).join('')}
                ${overdueTasks.length > 5 ? `<div class="text-[11px] text-coffee-300 text-center">还有 ${overdueTasks.length - 5} 条逾期任务</div>` : ''}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 右侧：任务列表 -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="flex items-center justify-between p-5 border-b border-cream-400">
              <h2 class="text-sm font-medium text-coffee-700">任务列表</h2>
              <span class="text-xs text-coffee-300">${displayTasks.length} 条${priority ? ' · ' + {high:'高',medium:'中',low:'低'}[priority] + '优先级' : ''}</span>
            </div>
            ${displayTasks.length === 0 ? `
              <div class="empty-state">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p class="text-sm">暂无任务</p>
              </div>
            ` : `
              <div class="divide-y divide-cream-200">
                ${displayTasks.map(t => `
                  <div class="list-item group">
                    <div class="flex items-start gap-3">
                      <div class="custom-checkbox ${t.completed ? 'checked' : ''} mt-0.5 shrink-0" onclick="Tasks.toggleComplete('${t.id}'); Router.navigate();"></div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm ${t.completed ? 'line-through text-coffee-300' : 'text-coffee-700'} font-medium">${t.title}</div>
                        ${t.description ? `<div class="text-xs text-coffee-300 mt-0.5">${t.description}</div>` : ''}
                        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span class="priority-${t.priority} text-[11px]">${{high:'高',medium:'中',low:'低'}[t.priority]}</span>
                          <span class="text-[11px] text-coffee-300">截止 ${t.dueDate}</span>
                          <span class="text-[11px] text-coffee-300">创建于 ${t.createdAt ? t.createdAt.slice(0, 10) : '未知'}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <button onclick="editTask('${t.id}')" class="opacity-0 group-hover:opacity-100 text-coffee-300 hover:text-clay-500 transition-opacity" title="编辑">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                        </button>
                        <button onclick="deleteTask('${t.id}')" class="opacity-0 group-hover:opacity-100 text-coffee-300 hover:text-red-400 transition-opacity" title="删除">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <!-- 批量操作栏 -->
              <div class="p-4 border-t border-cream-400 bg-cream-50/50 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button onclick="toggleSelectAllTasks()" class="text-xs text-coffee-500 hover:text-coffee-700 transition-colors">
                    <svg class="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    全选/取消全选
                  </button>
                  <span class="text-cream-300">|</span>
                  <button onclick="deleteCompletedTasks()" class="text-xs text-red-400 hover:text-red-500 transition-colors">
                    <svg class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                    删除已完成
                  </button>
                </div>
                <span class="text-[11px] text-coffee-300" id="selected-task-count">已选 0 项</span>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 状态筛选
function filterTasks(filter) {
  const url = new URL(window.location.href);
  if (filter !== 'all') url.searchParams.set('filter', filter);
  else url.searchParams.delete('filter');
  url.searchParams.delete('priority');
  window.history.replaceState({}, '', url.toString());
  Router.navigate();
}

// 优先级筛选
function filterByPriority(priority) {
  const url = new URL(window.location.href);
  url.searchParams.set('priority', priority);
  url.searchParams.delete('filter');
  window.history.replaceState({}, '', url.toString());
  Router.navigate();
}

// 全选/取消全选任务
function toggleSelectAllTasks() {
  const checkboxes = document.querySelectorAll('.task-list-checkbox');
  const allChecked = [...checkboxes].every(cb => cb.checked);
  checkboxes.forEach(cb => { cb.checked = !allChecked; });
  updateSelectedTaskCount();
}

// 更新已选任务数
function updateSelectedTaskCount() {
  const count = document.querySelectorAll('.task-list-checkbox:checked').length;
  const el = document.getElementById('selected-task-count');
  if (el) el.textContent = `已选 ${count} 项`;
}

// 删除已完成的任务
function deleteCompletedTasks() {
  const completed = Tasks.getCompleted();
  if (completed.length === 0) {
    alert('没有已完成的任务可删除');
    return;
  }
  if (confirm(`确定删除 ${completed.length} 条已完成的任务？`)) {
    completed.forEach(t => Tasks.delete(t.id));
    Router.navigate();
  }
}

// ==================== 8. 数据备份 ====================
function renderBackup() {
  const backups = Backup.getBackups();
  const recordCount = Records.getAll().length;
  const noteCount = Notes.getAll().length;
  const taskCount = Tasks.getAll().length;

  // 导入历史
  const importHistory = JSON.parse(localStorage.getItem('st_import_history') || '[]');

  // localStorage 已用空间估算
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith('st_')) {
      totalSize += localStorage.getItem(key).length * 2; // UTF-16 每字符 2 字节
    }
  }
  const sizeKB = (totalSize / 1024).toFixed(1);
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(3);
  const usagePercent = Math.min(Math.round((totalSize / (5 * 1024 * 1024)) * 100), 100); // 假设 5MB 上限

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">数据备份</h1>
        <p class="text-sm text-coffee-300 mt-1">导出导入数据 · 本地备份管理</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 导出 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">导出数据</h2>
          <!-- 选择性导出 -->
          <div class="mb-4">
            <div class="text-xs text-coffee-300 mb-2">选择导出内容</div>
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm text-coffee-500 cursor-pointer">
                <input type="checkbox" id="export-records" checked class="rounded">
                <span>学习记录</span>
                <span class="text-xs text-coffee-300 ml-auto">${recordCount} 条</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-coffee-500 cursor-pointer">
                <input type="checkbox" id="export-notes" checked class="rounded">
                <span>笔记</span>
                <span class="text-xs text-coffee-300 ml-auto">${noteCount} 条</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-coffee-500 cursor-pointer">
                <input type="checkbox" id="export-tasks" checked class="rounded">
                <span>任务</span>
                <span class="text-xs text-coffee-300 ml-auto">${taskCount} 条</span>
              </label>
              <label class="flex items-center gap-2 text-sm text-coffee-500 cursor-pointer">
                <input type="checkbox" id="export-settings" checked class="rounded">
                <span>设置</span>
                <span class="text-xs text-coffee-300 ml-auto">含分类与目标</span>
              </label>
            </div>
          </div>
          <div class="divider"></div>
          <!-- 导出格式说明 -->
          <div class="my-4 p-3 bg-cream-50 rounded-lg">
            <div class="text-xs font-medium text-coffee-700 mb-2">导出格式说明</div>
            <div class="space-y-1.5 text-[11px] text-coffee-300">
              <div class="flex items-start gap-2">
                <span class="text-cream-300 mt-0.5">·</span>
                <span>文件格式：JSON（UTF-8 编码），可直接用文本编辑器查看</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-cream-300 mt-0.5">·</span>
                <span>预估大小：约 ${sizeKB} KB（含全部数据时）</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-cream-300 mt-0.5">·</span>
                <span>兼容性：可在任意浏览器中导入，不受设备限制</span>
              </div>
            </div>
          </div>
          <button onclick="exportDataSelective()" class="btn btn-primary w-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            选择性导出
          </button>
        </div>

        <!-- 导入 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">导入数据</h2>
          <p class="text-xs text-coffee-300 mb-4">从 JSON 文件导入数据。导入将覆盖当前所有数据，建议先备份。</p>
          <div class="space-y-3">
            <div class="border-2 border-dashed border-cream-400 rounded-lg p-6 text-center">
              <input type="file" id="import-file" accept=".json" class="hidden" onchange="importData(this)">
              <label for="import-file" class="cursor-pointer">
                <svg class="w-8 h-8 mx-auto mb-2 text-cream-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                <p class="text-sm text-coffee-300">点击选择 JSON 文件</p>
                <p class="text-xs text-coffee-300 mt-1">或将文件拖放到此处</p>
              </label>
            </div>
            <!-- 导入预检区域（文件选择后动态显示） -->
            <div id="import-preview" style="display:none" class="p-4 bg-cream-50 rounded-lg border border-cream-400">
              <div class="text-xs font-medium text-coffee-700 mb-3">导入预检</div>
              <div class="grid grid-cols-3 gap-3 mb-3">
                <div class="text-center p-2 bg-white rounded">
                  <div class="text-sm font-medium text-coffee-700" id="preview-records">-</div>
                  <div class="text-[11px] text-coffee-300">学习记录</div>
                </div>
                <div class="text-center p-2 bg-white rounded">
                  <div class="text-sm font-medium text-coffee-700" id="preview-notes">-</div>
                  <div class="text-[11px] text-coffee-300">笔记</div>
                </div>
                <div class="text-center p-2 bg-white rounded">
                  <div class="text-sm font-medium text-coffee-700" id="preview-tasks">-</div>
                  <div class="text-[11px] text-coffee-300">任务</div>
                </div>
              </div>
              <div class="flex gap-2">
                <button onclick="confirmImport()" class="btn btn-primary text-xs py-1.5 flex-1">确认导入</button>
                <button onclick="cancelImport()" class="btn btn-outline text-xs py-1.5 flex-1">取消</button>
              </div>
            </div>
          </div>
          <!-- 导入历史 -->
          ${importHistory.length > 0 ? `
            <div class="mt-4 pt-4 border-t border-cream-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-coffee-700">导入历史</span>
                <button onclick="clearImportHistory()" class="text-[11px] text-coffee-300 hover:text-red-400 transition-colors">清除</button>
              </div>
              <div class="space-y-1.5 max-h-32 overflow-y-auto scroll-area">
                ${importHistory.slice().reverse().map(h => `
                  <div class="flex items-center justify-between text-[11px] py-1">
                    <span class="text-coffee-300">${h.time}</span>
                    <span class="${h.success ? 'text-mist-500' : 'text-red-400'}">${h.message}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 本地备份列表 -->
      <div class="card mt-6">
        <div class="flex items-center justify-between p-5 border-b border-cream-400">
          <h2 class="text-sm font-medium text-coffee-700">本地备份</h2>
          <button onclick="createBackup()" class="btn btn-secondary text-xs py-1.5 px-3">创建备份</button>
        </div>
        ${backups.length === 0 ? `
          <div class="empty-state">
            <p class="text-sm">暂无本地备份</p>
            <p class="text-xs mt-1">点击上方按钮创建备份</p>
          </div>
        ` : `
          <table class="data-table">
            <thead>
              <tr>
                <th>备份名称</th>
                <th>时间</th>
                <th>数据统计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${backups.map(b => {
                // 从备份数据中提取统计信息
                const bData = b.data || {};
                const bRecords = (bData.records || bData.studyRecords || []).length;
                const bNotes = (bData.notes || []).length;
                const bTasks = (bData.tasks || []).length;
                return `
                  <tr>
                    <td class="text-sm text-coffee-700">${b.name}</td>
                    <td class="text-xs text-coffee-300">${new Date(b.createdAt).toLocaleString('zh-CN')}</td>
                    <td class="text-xs text-coffee-300">
                      <span>记录 ${bRecords}</span>
                      <span class="mx-1 text-cream-300">/</span>
                      <span>笔记 ${bNotes}</span>
                      <span class="mx-1 text-cream-300">/</span>
                      <span>任务 ${bTasks}</span>
                    </td>
                    <td>
                      <div class="flex gap-2">
                        <button onclick="restoreBackup('${b.id}')" class="text-xs text-mist-500 hover:text-mist-400">恢复</button>
                        <button onclick="deleteBackup('${b.id}')" class="text-xs text-coffee-300 hover:text-red-400">删除</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>

      <!-- 存储空间概览 -->
      <div class="card mt-6 p-5">
        <h2 class="text-sm font-medium text-coffee-700 mb-3">存储空间概览</h2>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-coffee-500">已使用</span>
              <span class="text-coffee-300">${sizeMB} MB / 5 MB (约 ${usagePercent}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill ${usagePercent > 80 ? 'bg-red-400' : usagePercent > 50 ? 'bg-coffee-300' : 'bg-mist-400'}" style="width:${usagePercent}%"></div>
            </div>
          </div>
          <div class="text-center px-4 shrink-0">
            <div class="text-lg font-light text-coffee-700">${sizeKB}</div>
            <div class="text-[11px] text-coffee-300">KB</div>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div class="text-center p-2.5 bg-cream-50 rounded-lg">
            <div class="text-sm font-medium text-coffee-700">${recordCount}</div>
            <div class="text-[11px] text-coffee-300">学习记录</div>
          </div>
          <div class="text-center p-2.5 bg-cream-50 rounded-lg">
            <div class="text-sm font-medium text-coffee-700">${noteCount}</div>
            <div class="text-[11px] text-coffee-300">笔记</div>
          </div>
          <div class="text-center p-2.5 bg-cream-50 rounded-lg">
            <div class="text-sm font-medium text-coffee-700">${taskCount}</div>
            <div class="text-[11px] text-coffee-300">任务</div>
          </div>
          <div class="text-center p-2.5 bg-cream-50 rounded-lg">
            <div class="text-sm font-medium text-coffee-700">${backups.length}</div>
            <div class="text-[11px] text-coffee-300">本地备份</div>
          </div>
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="card mt-6 p-5">
        <h2 class="text-sm font-medium text-coffee-700 mb-3">注意事项</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2.5">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-coffee-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
              <div>
                <div class="text-xs text-coffee-700 font-medium">数据安全提示</div>
                <div class="text-[11px] text-coffee-300 mt-0.5">所有数据存储在浏览器本地 localStorage 中，清除浏览器数据会导致丢失。建议定期导出备份。</div>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-mist-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <div>
                <div class="text-xs text-coffee-700 font-medium">备份建议频率</div>
                <div class="text-[11px] text-coffee-300 mt-0.5">建议每周至少创建一次本地备份，重要学习节点（如完成课程、考试前）及时导出。</div>
              </div>
            </div>
          </div>
          <div class="space-y-2.5">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-coffee-300 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
              <div>
                <div class="text-xs text-coffee-700 font-medium">导入覆盖说明</div>
                <div class="text-[11px] text-coffee-300 mt-0.5">导入操作会覆盖当前所有对应数据，请确认已备份当前数据后再执行导入。</div>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-mist-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
              <div>
                <div class="text-xs text-coffee-700 font-medium">跨设备同步</div>
                <div class="text-[11px] text-coffee-300 mt-0.5">通过导出/导入 JSON 文件实现跨设备数据迁移，文件可保存至云盘或发送至其他设备。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 选择性导出
function exportDataSelective() {
  const includeRecords = document.getElementById('export-records').checked;
  const includeNotes = document.getElementById('export-notes').checked;
  const includeTasks = document.getElementById('export-tasks').checked;
  const includeSettings = document.getElementById('export-settings').checked;

  if (!includeRecords && !includeNotes && !includeTasks && !includeSettings) {
    alert('请至少选择一项导出内容');
    return;
  }

  const allData = Backup.exportAll();
  const data = {};
  if (includeRecords) data.records = allData.records || allData.studyRecords;
  if (includeNotes) data.notes = allData.notes;
  if (includeTasks) data.tasks = allData.tasks;
  if (includeSettings) data.settings = allData.settings;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const parts = [];
  if (includeRecords) parts.push('records');
  if (includeNotes) parts.push('notes');
  if (includeTasks) parts.push('tasks');
  if (includeSettings) parts.push('settings');
  a.download = `study-backup-${parts.join('-')}-${getTodayString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 兼容旧调用的导出函数
function exportData() {
  exportDataSelective();
}

// 导入数据（预检模式）
let pendingImportData = null;

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // 显示预检信息
      pendingImportData = data;
      const preview = document.getElementById('import-preview');
      if (preview) {
        preview.style.display = '';
        document.getElementById('preview-records').textContent = (data.records || data.studyRecords || []).length;
        document.getElementById('preview-notes').textContent = (data.notes || []).length;
        document.getElementById('preview-tasks').textContent = (data.tasks || []).length;
      }
    } catch (err) {
      alert('文件格式错误：无法解析 JSON 数据');
    }
  };
  reader.readAsText(file);
}

// 确认导入
function confirmImport() {
  if (!pendingImportData) {
    alert('没有待导入的数据');
    return;
  }
  if (confirm('确认导入？当前对应数据将被覆盖。')) {
    try {
      Backup.importAll(pendingImportData);
      // 记录导入历史
      const history = JSON.parse(localStorage.getItem('st_import_history') || '[]');
      history.push({
        time: new Date().toLocaleString('zh-CN'),
        success: true,
        message: `导入成功 (${(pendingImportData.records || pendingImportData.studyRecords || []).length} 条记录, ${(pendingImportData.notes || []).length} 条笔记, ${(pendingImportData.tasks || []).length} 条任务)`
      });
      // 最多保留 20 条历史
      if (history.length > 20) history.splice(0, history.length - 20);
      localStorage.setItem('st_import_history', JSON.stringify(history));

      pendingImportData = null;
      alert('数据导入成功');
      Router.navigate();
    } catch (err) {
      const history = JSON.parse(localStorage.getItem('st_import_history') || '[]');
      history.push({
        time: new Date().toLocaleString('zh-CN'),
        success: false,
        message: '导入失败：' + err.message
      });
      localStorage.setItem('st_import_history', JSON.stringify(history));
      alert('导入失败：' + err.message);
    }
  }
}

// 取消导入
function cancelImport() {
  pendingImportData = null;
  const preview = document.getElementById('import-preview');
  if (preview) preview.style.display = 'none';
  const fileInput = document.getElementById('import-file');
  if (fileInput) fileInput.value = '';
}

// 清除导入历史
function clearImportHistory() {
  localStorage.removeItem('st_import_history');
  Router.navigate();
}

function createBackup() {
  Backup.createSnapshot();
  Router.navigate();
}

function restoreBackup(id) {
  if (confirm('恢复备份将覆盖当前所有数据，确定继续？')) {
    Backup.restoreBackup(id);
    Router.navigate();
  }
}

function deleteBackup(id) {
  if (confirm('确定删除此备份？')) {
    Backup.deleteBackup(id);
    Router.navigate();
  }
}

// ==================== 9. 设置 ====================
function renderSettings() {
  const settings = Settings.get();
  const categories = settings.categories || [];

  // 各分类使用统计
  const categoryStats = {};
  Records.getAll().forEach(r => {
    categoryStats[r.category] = (categoryStats[r.category] || 0) + 1;
  });

  // 标签管理数据
  const allNotes = Notes.getAll();
  const tagCountMap = {};
  allNotes.forEach(n => {
    (n.tags || []).forEach(tag => {
      tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
    });
  });
  const tagEntries = Object.entries(tagCountMap).sort((a, b) => b[1] - a[1]);

  // 数据概况
  const totalRecords = Records.getAll().length;
  const totalNotes = Notes.getAll().length;
  const totalTasks = Tasks.getAll().length;
  const totalTags = tagEntries.length;

  // 当前字体大小设置
  const fontSize = settings.fontSize || 'medium';

  return `
    <div class="page-container page-fade-in">
      <div class="mb-8">
        <h1 class="text-2xl font-light text-coffee-700 tracking-tight">设置</h1>
        <p class="text-sm text-coffee-300 mt-1">个性化配置与数据管理</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 学习目标 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">学习目标</h2>
          <form id="goal-form" class="space-y-4">
            <div>
              <label class="block text-xs text-coffee-300 mb-1.5">每日学习时长目标（分钟）</label>
              <input type="number" name="dailyGoal" value="${settings.dailyGoal}" min="15" max="720" class="input-field">
              <div class="text-[11px] text-coffee-300 mt-1">建议设置 60-180 分钟的合理目标</div>
            </div>
            <div>
              <label class="block text-xs text-coffee-300 mb-1.5">每周学习时长目标（分钟）</label>
              <input type="number" name="weeklyGoal" value="${settings.weeklyGoal || settings.dailyGoal * 7}" min="60" max="5040" class="input-field">
              <div class="text-[11px] text-coffee-300 mt-1">默认为每日目标 x 7</div>
            </div>
            <div>
              <label class="block text-xs text-coffee-300 mb-1.5">每月学习时长目标（分钟）</label>
              <input type="number" name="monthlyGoal" value="${settings.monthlyGoal || settings.dailyGoal * 30}" min="120" max="21600" class="input-field">
              <div class="text-[11px] text-coffee-300 mt-1">默认为每日目标 x 30</div>
            </div>
            <button type="submit" class="btn btn-primary">保存设置</button>
          </form>
        </div>

        <!-- 显示设置 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">显示设置</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-coffee-300 mb-2">主题模式</label>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 border border-mist-300 rounded-lg cursor-pointer bg-mist-50/50">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>
                    <span class="text-sm text-coffee-700">浅色模式</span>
                  </div>
                  <div class="text-[11px] text-coffee-300">当前使用 · 淡雅简洁风格</div>
                </div>
                <div class="p-3 border border-cream-400 rounded-lg opacity-60">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-coffee-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>
                    <span class="text-sm text-coffee-500">深色模式</span>
                  </div>
                  <div class="text-[11px] text-coffee-300">即将推出</div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs text-coffee-300 mb-2">字体大小</label>
              <div class="grid grid-cols-3 gap-3">
                <button onclick="setFontSize('small')" class="p-2.5 border rounded-lg text-center transition-colors ${fontSize === 'small' ? 'border-mist-300 bg-mist-50/50' : 'border-cream-400 hover:border-cream-300'}">
                  <span class="text-xs text-coffee-700">小</span>
                  <div class="text-[10px] text-coffee-300 mt-0.5">紧凑</div>
                </button>
                <button onclick="setFontSize('medium')" class="p-2.5 border rounded-lg text-center transition-colors ${fontSize === 'medium' ? 'border-mist-300 bg-mist-50/50' : 'border-cream-400 hover:border-cream-300'}">
                  <span class="text-sm text-coffee-700">中</span>
                  <div class="text-[10px] text-coffee-300 mt-0.5">默认</div>
                </button>
                <button onclick="setFontSize('large')" class="p-2.5 border rounded-lg text-center transition-colors ${fontSize === 'large' ? 'border-mist-300 bg-mist-50/50' : 'border-cream-400 hover:border-cream-300'}">
                  <span class="text-base text-coffee-700">大</span>
                  <div class="text-[10px] text-coffee-300 mt-0.5">舒适</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分类管理 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">分类管理</h2>
          <form id="category-form" class="flex gap-2 mb-4">
            <input type="text" name="category" placeholder="新增分类名称" class="input-field flex-1">
            <button type="submit" class="btn btn-secondary">添加</button>
          </form>
          <div class="flex flex-wrap gap-2">
            ${categories.map(c => `
              <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-cream-50 rounded-md text-xs text-coffee-500">
                ${c}
                <span class="text-[10px] text-coffee-300">(${categoryStats[c] || 0})</span>
                ${!DEFAULT_CATEGORIES.includes(c) ? `<button onclick="removeCategory('${c}')" class="text-coffee-300 hover:text-red-400 ml-0.5" title="删除分类">×</button>` : ''}
              </div>
            `).join('')}
          </div>
          <div class="mt-3 flex items-center gap-2">
            <div class="text-[11px] text-coffee-300">分类使用统计：数字表示该分类下的学习记录数</div>
          </div>
          <p class="text-[11px] text-coffee-300 mt-1">默认分类不可删除</p>
        </div>

        <!-- 标签管理 -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-coffee-700">标签管理</h2>
            <span class="text-xs text-coffee-300">${tagEntries.length} 个标签</span>
          </div>
          ${tagEntries.length === 0 ? `
            <div class="text-center py-6">
              <p class="text-sm text-coffee-300">暂无标签</p>
              <p class="text-xs text-coffee-300 mt-1">在笔记中添加标签后会显示在这里</p>
            </div>
          ` : `
            <div class="space-y-1.5 max-h-60 overflow-y-auto scroll-area">
              ${tagEntries.map(([tag, count]) => `
                <div class="flex items-center justify-between py-1.5 px-2 hover:bg-cream-50 rounded transition-colors">
                  <div class="flex items-center gap-2">
                    <span class="tag tag-mist">${tag}</span>
                    <span class="text-[11px] text-coffee-300">${count} 条笔记</span>
                  </div>
                  <button onclick="removeTag('${tag}')" class="text-[11px] text-coffee-300 hover:text-red-400 transition-colors" title="删除标签">删除</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- 数据概况 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">数据概况</h2>
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${totalRecords}</div>
              <div class="text-[11px] text-coffee-300">学习记录</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${totalNotes}</div>
              <div class="text-[11px] text-coffee-300">笔记</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${totalTasks}</div>
              <div class="text-[11px] text-coffee-300">任务</div>
            </div>
            <div class="text-center p-3 bg-cream-50 rounded-lg">
              <div class="text-lg font-light text-coffee-700">${totalTags}</div>
              <div class="text-[11px] text-coffee-300">标签</div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-cream-200">
            <div class="flex justify-between text-xs text-coffee-300">
              <span>存储条目总数</span>
              <span class="text-coffee-500 font-medium">${totalRecords + totalNotes + totalTasks} 条</span>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">数据管理</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm text-coffee-700">重置示例数据</div>
                <div class="text-[11px] text-coffee-300">重新生成演示数据</div>
              </div>
              <button onclick="resetDemoData()" class="btn btn-secondary text-xs">重置</button>
            </div>
            <div class="divider" style="margin:12px 0"></div>
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm text-coffee-700">清除所有数据</div>
                <div class="text-[11px] text-coffee-300">删除所有学习记录、笔记和任务</div>
              </div>
              <button onclick="clearAllData()" class="btn btn-danger text-xs">清除</button>
            </div>
          </div>
        </div>

        <!-- 快捷键说明 -->
        <div class="card p-5">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">快捷键说明</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between py-1.5">
              <span class="text-xs text-coffee-500">全局搜索</span>
              <div class="flex gap-1">
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">Ctrl</kbd>
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">K</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span class="text-xs text-coffee-500">新建学习记录</span>
              <div class="flex gap-1">
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">Ctrl</kbd>
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">N</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span class="text-xs text-coffee-500">新建笔记</span>
              <div class="flex gap-1">
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">Ctrl</kbd>
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">Shift</kbd>
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">N</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span class="text-xs text-coffee-500">返回上一页</span>
              <div class="flex gap-1">
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">Alt</kbd>
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">←</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-1.5">
              <span class="text-xs text-coffee-500">快捷导出数据</span>
              <div class="flex gap-1">
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">Ctrl</kbd>
                <kbd class="px-1.5 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500 font-mono">E</kbd>
              </div>
            </div>
          </div>
          <div class="text-[11px] text-coffee-300 mt-3">快捷键为示意性说明，具体绑定需浏览器支持</div>
        </div>

        <!-- 关于 -->
        <div class="card p-5 lg:col-span-2">
          <h2 class="text-sm font-medium text-coffee-700 mb-4">关于</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <div>
                <div class="text-xs font-medium text-coffee-700 mb-1">功能说明</div>
                <div class="text-[11px] text-coffee-300 leading-relaxed">
                  每日学习记录是一款纯前端个人学习管理工具。支持学习时长记录、学习笔记管理、计划任务追踪、日历视图查看、数据统计分析等功能。帮助学习者建立持续的学习习惯，追踪学习进度。
                </div>
              </div>
              <div>
                <div class="text-xs font-medium text-coffee-700 mb-1">数据存储</div>
                <div class="text-[11px] text-coffee-300 leading-relaxed">
                  所有数据均存储在浏览器本地 localStorage 中，不会上传至任何服务器。数据完全属于用户本人，可随时导出备份。清除浏览器缓存或使用无痕模式会导致数据丢失。
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-xs font-medium text-coffee-700 mb-1">技术栈</div>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span class="px-2 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500">HTML5</span>
                  <span class="px-2 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500">Tailwind CSS</span>
                  <span class="px-2 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500">Vanilla JavaScript</span>
                  <span class="px-2 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500">localStorage API</span>
                  <span class="px-2 py-0.5 bg-cream-200 rounded text-[11px] text-coffee-500">SPA 路由</span>
                </div>
              </div>
              <div>
                <div class="text-xs font-medium text-coffee-700 mb-1">版本历史</div>
                <div class="space-y-1 text-[11px] text-coffee-300">
                  <div class="flex items-center gap-2">
                    <span class="text-coffee-500 w-12">v1.0.0</span>
                    <span>初始版本 - 核心功能完成</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-mist-500 w-12">v1.1.0</span>
                    <span>新增高级搜索、任务优先级、标签管理</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-cream-200 text-center">
            <p class="text-cream-300 text-xs">版本 1.1.0 · 每日学习记录 · 纯前端个人学习管理工具</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 设置字体大小
function setFontSize(size) {
  const s = Settings.get();
  s.fontSize = size;
  Settings.save(s);
  // 根据字体大小调整根元素
  const sizes = { small: '14px', medium: '16px', large: '18px' };
  document.documentElement.style.fontSize = sizes[size] || '16px';
  Router.navigate();
}

// 删除标签（从所有笔记中移除该标签）
function removeTag(tag) {
  if (!confirm(`确定删除标签「${tag}」？该标签将从所有笔记中移除。`)) return;
  const notes = Notes.getAll();
  notes.forEach(note => {
    if (note.tags && note.tags.includes(tag)) {
      note.tags = note.tags.filter(t => t !== tag);
      // 更新笔记（通过删除重建方式模拟）
      const updatedNote = { ...note };
      Notes.delete(note.id);
      Notes.create(updatedNote);
    }
  });
  Router.navigate();
}

function removeCategory(category) {
  Settings.removeCategory(category);
  Router.navigate();
}

function resetDemoData() {
  if (confirm('确定重置为示例数据？当前数据将被覆盖。')) {
    localStorage.removeItem('st_initialized');
    Backup.clearAll();
    initDemoData();
    Router.navigate();
  }
}

function clearAllData() {
  if (confirm('确定清除所有数据？此操作不可恢复。')) {
    Backup.clearAll();
    localStorage.removeItem('st_initialized');
    Router.navigate();
  }
}

// ==================== 删除确认（await 完成后再刷新页面）====================

async function deleteRecord(id) {
  if (!confirm('确定删除这条学习记录？')) return;
  await Records.delete(id);
  Router.navigate();
}

async function deleteNote(id) {
  if (!confirm('确定删除这条笔记？')) return;
  await Notes.delete(id);
  Router.navigate();
}

async function deleteTask(id) {
  if (!confirm('确定删除这个任务？')) return;
  await Tasks.delete(id);
  Router.navigate();
}

// ==================== 编辑弹窗 ====================

function _escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showEditModal(title, formHtml) {
  const old = document.getElementById('edit-modal-overlay');
  if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.id = 'edit-modal-overlay';
  overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-coffee-800/40 backdrop-blur-sm p-4';
  overlay.innerHTML = `
    <div class="card p-6 w-full max-w-md mx-4 shadow-soft-lg max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-medium text-coffee-700">${title}</h3>
        <button onclick="closeEditModal()" class="text-coffee-300 hover:text-coffee-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      ${formHtml}
    </div>
  `;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeEditModal(); });
  document.body.appendChild(overlay);
}

function closeEditModal() {
  const el = document.getElementById('edit-modal-overlay');
  if (el) el.remove();
}

function editRecord(id) {
  const r = Cache.getRecords().find(x => String(x.id) === String(id));
  if (!r) return;
  const categories = Settings.getCategories();
  showEditModal('编辑学习记录', `
    <form id="edit-record-form" class="space-y-3">
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">学习内容</label>
        <input type="text" name="subject" value="${_escapeHtml(r.subject)}" class="input-field" required>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-coffee-300 mb-1.5">分类</label>
          <select name="category" class="input-field">
            ${categories.map(c => `<option value="${c}" ${c === r.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs text-coffee-300 mb-1.5">时长（分钟）</label>
          <input type="number" name="duration" value="${r.duration || ''}" class="input-field" min="1" required>
        </div>
      </div>
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">详细内容</label>
        <textarea name="content" rows="3" class="input-field resize-none">${_escapeHtml(r.content)}</textarea>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="button" onclick="closeEditModal()" class="btn btn-secondary flex-1">取消</button>
        <button type="submit" class="btn btn-primary flex-1">保存修改</button>
      </div>
    </form>
  `);
  document.getElementById('edit-record-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = '保存中...'; btn.disabled = true;
    try {
      await Records.update(id, {
        subject: data.subject,
        category: data.category,
        duration: parseInt(data.duration),
        content: data.content || '',
      });
      closeEditModal();
      Router.navigate();
    } catch (err) {
      alert('保存失败：' + err.message);
      btn.textContent = '保存修改'; btn.disabled = false;
    }
  });
}

function editNote(id) {
  const n = Cache.getNotes().find(x => String(x.id) === String(id));
  if (!n) return;
  const tagsStr = Array.isArray(n.tags) ? n.tags.join(', ') : (n.tags || '');
  showEditModal('编辑笔记', `
    <form id="edit-note-form" class="space-y-3">
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">标题</label>
        <input type="text" name="title" value="${_escapeHtml(n.title)}" class="input-field" required>
      </div>
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">内容</label>
        <textarea name="content" rows="5" class="input-field resize-none">${_escapeHtml(n.content)}</textarea>
      </div>
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">标签（逗号分隔）</label>
        <input type="text" name="tags" value="${_escapeHtml(tagsStr)}" class="input-field" placeholder="标签1, 标签2">
      </div>
      <div class="flex gap-3 pt-2">
        <button type="button" onclick="closeEditModal()" class="btn btn-secondary flex-1">取消</button>
        <button type="submit" class="btn btn-primary flex-1">保存修改</button>
      </div>
    </form>
  `);
  document.getElementById('edit-note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const tags = data.tags ? data.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = '保存中...'; btn.disabled = true;
    try {
      await Notes.update(id, {
        title: data.title,
        content: data.content || '',
        tags: tags,
      });
      closeEditModal();
      Router.navigate();
    } catch (err) {
      alert('保存失败：' + err.message);
      btn.textContent = '保存修改'; btn.disabled = false;
    }
  });
}

function editTask(id) {
  const t = Cache.getTasks().find(x => String(x.id) === String(id));
  if (!t) return;
  const dueDate = t.dueDate || t.due_date || '';
  showEditModal('编辑任务', `
    <form id="edit-task-form" class="space-y-3">
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">任务标题</label>
        <input type="text" name="title" value="${_escapeHtml(t.title)}" class="input-field" required>
      </div>
      <div>
        <label class="block text-xs text-coffee-300 mb-1.5">描述</label>
        <textarea name="description" rows="3" class="input-field resize-none">${_escapeHtml(t.description)}</textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-coffee-300 mb-1.5">优先级</label>
          <select name="priority" class="input-field">
            <option value="high" ${t.priority === 'high' ? 'selected' : ''}>高</option>
            <option value="medium" ${t.priority === 'medium' ? 'selected' : ''}>中</option>
            <option value="low" ${t.priority === 'low' ? 'selected' : ''}>低</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-coffee-300 mb-1.5">截止日期</label>
          <input type="date" name="dueDate" value="${dueDate}" class="input-field">
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button type="button" onclick="closeEditModal()" class="btn btn-secondary flex-1">取消</button>
        <button type="submit" class="btn btn-primary flex-1">保存修改</button>
      </div>
    </form>
  `);
  document.getElementById('edit-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = '保存中...'; btn.disabled = true;
    try {
      await Tasks.update(id, {
        title: data.title,
        description: data.description || '',
        priority: data.priority,
        dueDate: data.dueDate,
      });
      closeEditModal();
      Router.navigate();
    } catch (err) {
      alert('保存失败：' + err.message);
      btn.textContent = '保存修改'; btn.disabled = false;
    }
  });
}