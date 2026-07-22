<template>
  <div id="app">
    <nav class="navbar">
      <div class="brand">
        <img src="/logo_icon.jpg" alt="用功日志" class="brand-logo" />
        <span class="brand-name">用功日志</span>
      </div>
      <ul class="nav-links">
        <li><router-link to="/">首页</router-link></li>
        <li><router-link to="/about">关于我们</router-link></li>
        <li><router-link to="/products">产品服务</router-link></li>
        <li><router-link to="/contact">联系我们</router-link></li>
      </ul>
    </nav>
    <main>
      <router-view />
    </main>
    <footer class="footer">
      <div class="footer-brand">
        <img src="/logo_icon.jpg" alt="用功日志" class="footer-logo" />
        <span>用功日志 · 记下每一段用功的时光</span>
      </div>
      <p class="footer-copy">© {{ year }} 用功日志 - 保留所有权利</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 2rem;
  background: #fffaf3;
  border-bottom: 1px solid #f0e4d3;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 8px rgba(195, 141, 107, 0.08);
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}
.brand-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #3d3229;
  letter-spacing: 0.08em;
}
.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}
.nav-links a {
  color: #6b5b4f;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
  position: relative;
}
.nav-links a:hover,
.nav-links a.router-link-active {
  color: #c38d6b;
}
.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 2px;
  background: #c38d6b;
  border-radius: 2px;
}
.footer {
  text-align: center;
  padding: 2.5rem 2rem 2rem;
  background: #fffaf3;
  border-top: 1px solid #f0e4d3;
  color: #8a7a6e;
}
.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
  color: #3d3229;
  font-size: 1rem;
  font-weight: 500;
}
.footer-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}
.footer-copy {
  font-size: 0.85rem;
  color: #a89888;
}
main {
  min-height: calc(100vh - 140px);
}
</style>
