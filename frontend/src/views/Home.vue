<template>
  <div class="home">
    <section class="hero">
      <img :src="'/static/logo_full.jpg'" alt="用功日志" class="hero-logo" />
      <p class="tagline">记下每一段用功的时光</p>
      <p class="intro">
        简单好用的线上学习日记本，随手记录当日学习状态、难点、完成任务，<br />
        搭配数据统计看清学习规律，稳步调整学习节奏。
      </p>
      <div class="hero-actions">
        <router-link to="/products" class="cta-btn primary">开始记录</router-link>
        <router-link to="/about" class="cta-btn ghost">了解更多</router-link>
      </div>
    </section>
    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">📝</div>
        <h3>随手记录</h3>
        <p>轻量日记本，快速记录每日学习状态、难点与完成任务</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>数据统计</h3>
        <p>可视化学习规律，看清自己的学习节奏与成长轨迹</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>稳步调整</h3>
        <p>依据数据反馈，科学调整学习计划，持续进步</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 5rem 2rem 4rem;
  background: linear-gradient(180deg, #fffaf3 0%, #fdeede 100%);
}
.hero-logo {
  width: 320px;
  max-width: 80%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(195, 141, 107, 0.18);
  margin-bottom: 1.8rem;
}
.tagline {
  font-size: 1.6rem;
  color: #c38d6b;
  font-weight: 500;
  letter-spacing: 0.1em;
  margin-bottom: 1.2rem;
}
.intro {
  font-size: 1.05rem;
  color: #6b5b4f;
  line-height: 1.9;
  margin-bottom: 2.2rem;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
.cta-btn {
  display: inline-block;
  padding: 0.8rem 2.2rem;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s;
  letter-spacing: 0.05em;
}
.cta-btn.primary {
  background: #c38d6b;
  color: #fff;
}
.cta-btn.primary:hover {
  background: #b07a58;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(195, 141, 107, 0.35);
}
.cta-btn.ghost {
  background: transparent;
  color: #c38d6b;
  border: 1px solid #c38d6b;
}
.cta-btn.ghost:hover {
  background: #c38d6b;
  color: #fff;
}
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.feature-card {
  padding: 2.5rem 2rem;
  border-radius: 12px;
  background: #fffaf3;
  text-align: center;
  border: 1px solid #f0e4d3;
  transition: all 0.3s;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(195, 141, 107, 0.12);
  border-color: #e8a87c;
}
.feature-icon {
  font-size: 2.4rem;
  margin-bottom: 1rem;
}
.feature-card h3 {
  color: #3d3229;
  margin-bottom: 0.6rem;
  font-size: 1.25rem;
}
.feature-card p {
  color: #6b5b4f;
  line-height: 1.7;
  font-size: 0.95rem;
}
</style>
