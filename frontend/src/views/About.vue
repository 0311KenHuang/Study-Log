<template>
  <div class="page">
    <div class="page-header">
      <img src="/logo_icon.jpg" alt="用功日志" class="page-logo" />
      <h1>关于用功日志</h1>
      <p class="subtitle">记下每一段用功的时光</p>
    </div>
    <div class="content">
      <p>
        「用功日志」是一个简单好用的线上学习日记本。我们相信，每一份用功都值得被看见、被记录。
      </p>
      <p>
        无论是备考复习、技能学习，还是日常充电，用功日志都能帮你随手记录当日学习状态、遇到的难点与完成的任务。搭配数据统计，让你看清自己的学习规律，稳步调整学习节奏。
      </p>
      <h2>我们的理念</h2>
      <ul>
        <li>简单纯粹 —— 不打扰，只陪伴</li>
        <li>数据驱动 —— 看清规律，科学进步</li>
        <li>温暖记录 —— 让每一段用功时光都有迹可循</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}
.page-logo {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  object-fit: cover;
  margin-bottom: 1.2rem;
  box-shadow: 0 4px 16px rgba(195, 141, 107, 0.18);
}
.page h1 {
  color: #3d3229;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}
.subtitle {
  color: #c38d6b;
  font-size: 1.1rem;
  letter-spacing: 0.08em;
}
.content p {
  color: #555;
  line-height: 1.9;
  margin-bottom: 1.2rem;
  font-size: 1rem;
}
.content h2 {
  color: #3d3229;
  margin: 2rem 0 1rem;
  font-size: 1.3rem;
}
.content ul {
  list-style: none;
  padding: 0;
}
.content li {
  color: #6b5b4f;
  line-height: 2.2;
  padding-left: 1.5rem;
  position: relative;
}
.content li::before {
  content: '·';
  color: #c38d6b;
  font-size: 2rem;
  position: absolute;
  left: 0;
  top: -0.3rem;
}
</style>
