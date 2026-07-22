<template>
  <div class="page">
    <h1>产品功能</h1>
    <p class="subtitle">简单好用的学习日记，陪伴你的每一段用功时光</p>
    <div class="product-list">
      <div class="product-card" v-for="item in features" :key="item.title">
        <div class="card-icon">{{ item.icon }}</div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const features = reactive([
  {
    icon: '📝',
    title: '学习日记',
    desc: '随手记录当日学习状态、难点与完成任务，支持标签分类与快速检索。',
  },
  {
    icon: '📊',
    title: '数据统计',
    desc: '可视化学习时长、任务完成率与学习规律，让进步看得见。',
  },
  {
    icon: '🎯',
    title: '目标管理',
    desc: '设定学习目标与计划，依据数据反馈科学调整学习节奏。',
  },
  {
    icon: '🔔',
    title: '习惯养成',
    desc: '每日提醒与打卡，帮助你建立稳定的学习习惯，持续累积。',
  },
  {
    icon: '🏷️',
    title: '知识标签',
    desc: '为每条记录打上标签，构建专属知识图谱，复盘更高效。',
  },
  {
    icon: '🌙',
    title: '夜间模式',
    desc: '护眼夜间模式，深夜学习同样舒适，不打扰每一份专注。',
  },
])
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}
.page h1 {
  color: #3d3229;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.subtitle {
  text-align: center;
  color: #8a7a6e;
  margin-bottom: 3rem;
  font-size: 1.05rem;
}
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}
.product-card {
  padding: 2rem;
  border-radius: 12px;
  background: #fffaf3;
  border: 1px solid #f0e4d3;
  transition: all 0.3s;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(195, 141, 107, 0.12);
  border-color: #e8a87c;
}
.card-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}
.product-card h3 {
  color: #3d3229;
  margin-bottom: 0.6rem;
  font-size: 1.2rem;
}
.product-card p {
  color: #6b5b4f;
  line-height: 1.7;
  font-size: 0.95rem;
}
</style>
