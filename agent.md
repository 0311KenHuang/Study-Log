# 企业官网开发实战 - 项目说明文档

## 项目概述

本项目是一个前后端分离的企业官网系统，采用 **Vue 3** 作为前端框架，**Django** 作为后端框架，通过 REST API 进行数据交互。

## 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.10.11 | 运行环境 |
| Django | 5.2.16 | Web 后端框架 |
| django-simpleui | 2026.1.13 | Django Admin 美化框架 |
| SQLite3 | - | 开发阶段数据库 |

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.40 | 前端框架 |
| TypeScript | 6.0.2 | 类型系统 |
| Vite | 8.1.1 | 构建工具 |
| Vue Router | 5.2.0 | 客户端路由 |
| Pinia | 4.0.2 | 状态管理 |
| Axios | 1.18.1 | HTTP 请求库 |

## 项目结构

```
企业官网开发实战/
├── corporate_site/                # Django 项目配置
│   ├── __init__.py
│   ├── asgi.py                    # ASGI 入口
│   ├── settings.py                # 项目设置
│   ├── urls.py                    # 根 URL 路由
│   └── wsgi.py                    # WSGI 入口
├── main/                          # Django 主应用
│   ├── migrations/
│   ├── __init__.py
│   ├── admin.py                   # Admin 后台注册
│   ├── apps.py                    # 应用配置
│   ├── models.py                  # 数据模型
│   ├── tests.py                   # 测试
│   └── views.py                   # 视图
├── frontend/                      # Vue 前端项目
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/                # 静态资源
│   │   │   ├── hero.png
│   │   │   ├── typescript.svg
│   │   │   └── vite.svg
│   │   ├── router/
│   │   │   └── index.ts           # 路由配置
│   │   ├── views/                 # 页面组件
│   │   │   ├── Home.vue           # 首页
│   │   │   ├── About.vue          # 关于我们
│   │   │   ├── Products.vue       # 产品服务
│   │   │   └── Contact.vue        # 联系我们
│   │   ├── App.vue                # 根组件（导航栏 + 页脚）
│   │   ├── main.ts                # 前端入口
│   │   └── style.css              # 全局样式
│   ├── index.html                 # HTML 入口
│   ├── package.json               # 依赖管理
│   ├── tsconfig.json              # TypeScript 配置
│   └── vite.config.ts             # Vite 配置（含 API 代理）
├── venv/                          # Python 虚拟环境
├── db.sqlite3                     # SQLite 数据库
├── manage.py                      # Django 管理脚本
└── agent.md                       # 本文件
```

## 环境配置

### Python 虚拟环境

```powershell
# 创建虚拟环境
python -m virtualenv venv

# 激活虚拟环境（Windows PowerShell）
.\venv\Scripts\Activate.ps1

# 退出虚拟环境
deactivate
```

### 安装 Python 依赖

```powershell
# 激活虚拟环境后
pip install django django-simpleui
```

### 安装前端依赖

```powershell
cd frontend
npm install
```

## 启动项目

### 后端（Django）

```powershell
# 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 启动开发服务器（默认 8000 端口）
python manage.py runserver
```

### 前端（Vue）

```powershell
cd frontend
npm run dev
```

### 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:5173/ | Vue 开发服务器 |
| Django Admin | http://127.0.0.1:8000/admin/ | SimpleUI 美化后台 |

## 超级管理员

| 字段 | 值 |
|------|-----|
| 用户名 | Ken |
| 密码 | admin123 |
| 邮箱 | 3296651736@qq.com |
| 昵称 | wangdake |

## 前后端通信

前端 Vite 配置了 API 代理，开发环境下前端请求 `/api/*` 会自动转发到 Django 后端 `http://127.0.0.1:8000`：

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  },
}
```

前端使用 Axios 发起请求示例：

```typescript
import axios from 'axios'

// 获取数据
const response = await axios.get('/api/xxx/')

// 提交数据
const response = await axios.post('/api/xxx/', { key: 'value' })
```

## Django 关键配置

- **语言**: `zh-hans`（简体中文）
- **时区**: `Asia/Shanghai`
- **DEBUG**: `True`（开发模式）
- **数据库**: SQLite3（`db.sqlite3`）
- **Admin 美化**: SimpleUI（`INSTALLED_APPS` 第一项）
- **主应用**: `main`（尚未加入 `INSTALLED_APPS`，需在开发 API 时添加）

## 前端路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | Home.vue | 首页（Hero 区域 + 特性卡片） |
| `/about` | About.vue | 关于我们 |
| `/products` | Products.vue | 产品服务 |
| `/contact` | Contact.vue | 联系我们 |

## 学习记录模块（study-tracker）

纯前端个人每日学习记录网站，位于 `frontend/study-tracker/`，技术栈为 HTML + Tailwind CSS + 原生 JavaScript，数据持久化到 localStorage。

### 导航功能说明

| 导航 | 功能描述 |
|------|----------|
| **首页 / 今日学习** | 当日学习记录快速录入、今日总时长、待完成学习任务、今日随笔入口，核心高频页面 |
| **日历档案** | 日历热力图视图，按日期查看全部历史学习日志，按月切换复盘过往记录 |
| **数据统计** | 可视化图表专区：科目时长占比、月度趋势、年度学习报告、各状态标签统计 |
| **笔记资料库** | 汇总所有上传附件、错题笔记、知识点摘抄、自定义学习合集归档 |
| **检索查询** | 全局多条件筛选：科目、标签、关键词、时间段，快速定位历史学习内容 |
| **计划任务** | 周/月学习规划、待办清单、阶段性目标打卡，搭配完成进度记录 |
| **数据备份** | 记录导入导出、批量备份、本地文件下载、历史备份文件管理 |
| **设置** | 账号密码、深浅主题、字体/配色自定义、自定义科目&标签、网站基础配置 |

### 启动方式

```powershell
cd frontend/study-tracker
python -m http.server 8080
# 访问 http://localhost:8080/
```

## 后续开发计划

1. **安装 Django REST Framework** - 构建前后端分离的 REST API
2. **设计数据模型** - 在 `main/models.py` 中定义业务模型
3. **编写 API 接口** - 使用 DRF 的 `ModelSerializer` 和 `ViewSet`
4. **配置 CORS** - 安装 `django-cors-headers` 处理跨域
5. **前后端联调** - 前端通过 Axios 调用后端 API 获取数据
6. **生产部署** - 前端 `npm run build` 打包，Django 收集静态文件部署