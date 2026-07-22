<template>
  <div class="page">
    <h1>联系我们</h1>
    <p class="subtitle">每一段用功的时光，都值得被记录与陪伴</p>
    <div class="contact-cards">
      <div class="contact-card">
        <div class="contact-icon">✉️</div>
        <h3>邮箱</h3>
        <p>hello@yonggong.com</p>
      </div>
      <div class="contact-card">
        <div class="contact-icon">💬</div>
        <h3>客服</h3>
        <p>400-888-2026</p>
      </div>
      <div class="contact-card">
        <div class="contact-icon">📍</div>
        <h3>地址</h3>
        <p>中国上海市浦东新区</p>
      </div>
    </div>
    <div class="msg-box">
      <p>有任何建议或想法，欢迎随时来信，我们会认真阅读每一条反馈。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.page {
  max-width: 1000px;
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
.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}
.contact-card {
  padding: 2rem;
  border-radius: 12px;
  background: #fffaf3;
  border: 1px solid #f0e4d3;
  text-align: center;
  transition: all 0.3s;
}
.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(195, 141, 107, 0.12);
  border-color: #e8a87c;
}
.contact-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}
.contact-card h3 {
  color: #3d3229;
  margin-bottom: 0.5rem;
}
.contact-card p {
  color: #6b5b4f;
  line-height: 1.6;
}
.msg-box {
  text-align: center;
  padding: 1.8rem;
  background: #fdeede;
  border-radius: 12px;
  color: #6b5b4f;
  line-height: 1.8;
}
</style>
