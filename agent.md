# 企业官网开发实战 - 项目说明文档

## 项目概述

本项目是一个全栈学习记录与追踪应用 **"用功日志"**，采用 **Django + DRF** 作为后端框架提供 RESTful API，**Vue 3** 作为品牌门户展示前端（构建后由 Django 统一服务），**原生 HTML + Tailwind CSS** 作为学习记录核心应用界面。Vue 门户与 study-tracker 已整合到 Django 单服务中，通过路由对接形成完整的应用入口。支持本地开发与 Render.com 一键部署。

## 技术栈

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| Python | 3.12 | 运行环境 |
| Django | 5.2.16 | Web 后端框架 |
| Django REST Framework | 3.17.1 | RESTful API 构建 |
| django-cors-headers | 4.9.0 | 跨域请求支持 |
| django-simpleui | 2026.1.13 | Django Admin 美化框架 |
| Gunicorn | 23.0.0 | 生产环境 WSGI 服务器 |
| WhiteNoise | 6.9.0 | 生产环境静态文件服务 |
| SQLite3 | - | 数据库 |

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.40 | 门户展示页框架 |
| TypeScript | 6.0.2 | 类型系统 |
| Vite | 8.1.1 | 构建工具（base: /static/） |
| Vue Router | 5.2.0 | 客户端路由（history 模式，base: /portal/） |
| Pinia | 4.0.2 | 状态管理 |
| Axios | 1.18.1 | HTTP 请求库 |
| Tailwind CSS | CDN | study-tracker 样式框架 |

### 部署

| 平台 | 说明 |
|------|------|
| Render.com | 免费自动部署平台 |
| GitHub | 代码托管与版本管理 |

## 项目结构

```
企业官网开发实战/
├── corporate_site/                # Django 项目配置
│   ├── __init__.py
│   ├── asgi.py                    # ASGI 入口
│   ├── settings.py                # 项目设置(环境变量 / DRF / CORS / WhiteNoise / 静态文件)
│   ├── urls.py                    # 根路由(admin + api + study-tracker + portal)
│   └── wsgi.py                    # WSGI 入口
├── main/                          # Django 主应用
│   ├── migrations/                # 数据库迁移文件
│   ├── __init__.py
│   ├── admin.py                   # Admin 后台注册
│   ├── apps.py                    # 应用配置
│   ├── models.py                  # 7 张数据模型(记录/笔记/任务/分类/目标/备份/搜索历史)
│   ├── serializers.py             # DRF 序列化器
│   ├── tests.py                   # 测试
│   ├── urls.py                    # API 路由注册(DefaultRouter)
│   └── views.py                   # DRF ViewSet + 统计聚合接口
├── frontend/                      # 前端项目
│   ├── public/                    # 公共静态资源
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/                       # Vue 3 门户源码
│   │   ├── assets/                # 静态资源
│   │   ├── router/
│   │   │   └── index.ts           # 路由配置(history 模式，base: /portal/)
│   │   ├── views/                 # 页面组件
│   │   │   ├── Home.vue           # 首页(Hero 区域 + 功能卡片，对接 study-tracker 路由)
│   │   │   ├── About.vue          # 关于我们
│   │   │   ├── Products.vue       # 产品服务
│   │   │   └── Contact.vue        # 联系我们
│   │   ├── App.vue                # 根组件(导航栏 + 页脚)
│   │   ├── main.ts                # 前端入口
│   │   ├── style.css              # 全局样式
│   │   └── shims-vue.d.ts        # Vue 类型声明
│   ├── dist/                      # Vue 构建产物(已提交到 Git)
│   │   ├── index.html             # SPA 入口
│   │   └── portal/assets/         # 构建后的 JS/CSS
│   ├── study-tracker/             # 学习追踪应用(原生 JS + Tailwind)
│   │   ├── index.html             # 主页面(8 个功能模块)
│   │   ├── css/styles.css         # 全局样式
│   │   └── js/
│   │       ├── app.js             # 应用入口
│   │       ├── router.js          # 前端路由(hash)
│   │       ├── pages.js           # 页面渲染逻辑
│   │       └── data.js            # 数据交互层(API 调用，相对路径 /api)
│   ├── index.html                 # Vue HTML 入口
│   ├── package.json               # npm 依赖
│   ├── tsconfig.json              # TypeScript 配置
│   └── vite.config.ts             # Vite 配置(base: /static/，assetsDir: portal/assets)
├── assets/                        # 品牌素材(Logo)
├── manage.py                      # Django 管理脚本
├── requirements.txt               # Python 依赖清单
├── Procfile                       # 部署启动命令(Gunicorn)
├── render.yaml                    # Render.com 部署配置
├── .python-version                # Python 版本声明
├── .gitignore                     # Git 忽略规则
├── README.md                      # GitHub 仓库说明文档
└── agent.md                       # 本文件
```

## 环境配置

### Python 虚拟环境

```powershell
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Windows PowerShell）
.\venv\Scripts\Activate.ps1

# 退出虚拟环境
deactivate
```

### 安装依赖

```powershell
# Python 依赖（激活虚拟环境后）
pip install -r requirements.txt

# 前端依赖（修改 Vue 门户源码后构建时需要）
cd frontend
npm install
```

## 启动项目

### 本地开发（推荐方式）

study-tracker 和 Vue 门户都已整合到 Django 中，只需启动一个服务即可访问全部页面和 API：

```powershell
# 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 执行数据库迁移
python manage.py migrate

# 启动开发服务器（默认 8000 端口）
python manage.py runserver
```

启动后访问以下地址：

| 地址 | 说明 |
|------|------|
| http://127.0.0.1:8000/ | 用功日志首页（study-tracker 主应用） |
| http://127.0.0.1:8000/#today | 今日学习（study-tracker hash 路由） |
| http://127.0.0.1:8000/#stats | 数据统计（study-tracker hash 路由） |
| http://127.0.0.1:8000/#tasks | 计划任务（study-tracker hash 路由） |
| http://127.0.0.1:8000/portal/ | Vue 门户首页（品牌展示页） |
| http://127.0.0.1:8000/portal/about/ | 关于我们（Vue 门户子路由） |
| http://127.0.0.1:8000/portal/products/ | 产品服务（Vue 门户子路由） |
| http://127.0.0.1:8000/portal/contact/ | 联系我们（Vue 门户子路由） |
| http://127.0.0.1:8000/api/ | REST API 接口列表 |
| http://127.0.0.1:8000/admin/ | Django Admin 后台（SimpleUI 美化） |

### 修改 Vue 门户后重新构建

如果修改了 Vue 门户源码（`frontend/src/` 下的文件），需要重新构建：

```powershell
cd frontend
npm run build
cd ..
python manage.py collectstatic --noinput
```

构建后刷新浏览器即可看到更新。study-tracker 的代码不需要构建，改完直接刷新即可。

### Vue 门户独立开发模式（可选）

如需使用 Vite 热更新开发 Vue 门户页面：

```powershell
cd frontend
npm run dev
```

Vite 开发服务器运行在 `http://localhost:5173`，已配置 `/api` 和 `/static` 代理到 Django 8000 端口。

## 门户与主应用的路由对接

Vue 门户首页的按钮和功能卡片已对接到 study-tracker 的功能页面：

| 门户页面元素 | 点击后跳转到 | study-tracker 功能 |
|-------------|-------------|-------------------|
| "开始记录"按钮 | `/#today` | 今日学习页面 |
| "随手记录"卡片 | `/#today` | 今日学习页面 |
| "数据统计"卡片 | `/#stats` | 数据统计页面 |
| "稳步调整"卡片 | `/#tasks` | 计划任务页面 |
| "了解更多"按钮 | `/portal/about/` | 保持在 Vue 门户内 |

## 数据模型

| 模型 | 表名 | 说明 |
|------|------|------|
| StudyRecord | study_records | 每日学习记录（日期、主题、时长、内容、分类） |
| StudyNote | study_notes | 学习笔记（标题、内容、标签） |
| StudyTask | study_tasks | 学习任务（标题、描述、优先级、截止日期、完成状态） |
| StudyCategory | study_categories | 学习分类（名称、颜色、默认标记） |
| StudyGoal | study_goals | 学习目标（周期、目标时长） |
| StudyBackup | study_backups | 数据备份（名称、数据、文件大小） |
| SearchHistory | study_search_history | 搜索历史（关键词、类型、结果数量） |

## API 接口

所有接口前缀为 `/api/`，基于 DRF ViewSet 自动生成：

| 端点 | 方法 | 功能 | 自定义 Action |
|------|------|------|---------------|
| `/api/records/` | GET/POST/PATCH/DELETE | 学习记录 CRUD | `stats/`(统计)、`today/`(今日)、`daily_stats/`(趋势) |
| `/api/notes/` | GET/POST/PATCH/DELETE | 学习笔记 CRUD | `search/`(全文搜索)、`all_tags/`(标签列表) |
| `/api/tasks/` | GET/POST/PATCH/DELETE | 学习任务 CRUD | `toggle/`(切换完成)、`stats/`(统计) |
| `/api/categories/` | GET/POST/DELETE | 学习分类 CRUD | |
| `/api/goals/` | GET/POST/PATCH | 学习目标 CRUD | |
| `/api/backups/` | GET/POST/DELETE | 数据备份 CRUD | |
| `/api/search-history/` | GET/POST/DELETE | 搜索历史 CRUD | |

## 超级管理员

| 字段 | 值 |
|------|-----|
| 用户名 | Ken |
| 密码 | admin123 |
| 邮箱 | 3296651736@qq.com |
| 昵称 | wangdake |

## Django 关键配置

- **语言**: `zh-hans`（简体中文）
- **时区**: `Asia/Shanghai`
- **DEBUG**: 通过环境变量配置，默认 `True`（开发模式）
- **SECRET_KEY**: 通过环境变量配置，生产环境必须设置
- **ALLOWED_HOSTS**: 通过环境变量配置，默认 `localhost,127.0.0.1`
- **数据库**: SQLite3（`db.sqlite3`）
- **Admin 美化**: SimpleUI（`INSTALLED_APPS` 第一项）
- **主应用**: `main`（已注册到 `INSTALLED_APPS`）
- **REST Framework**: 已配置 `AllowAny` 权限，无分页
- **CORS**: 全局允许跨域
- **静态文件**: WhiteNoise 中间件，生产环境自动压缩
- **静态文件目录**: `STATICFILES_DIRS` 注册了 `frontend/study-tracker` 和 `frontend/dist`

## 前端路由

### Vue 门户（history 模式，base: /portal/）

| 路径 | 组件 | 说明 |
|------|------|------|
| `/portal/` | Home.vue | 首页（Hero 区域 + 功能卡片，对接 study-tracker） |
| `/portal/about/` | About.vue | 关于我们 |
| `/portal/products/` | Products.vue | 产品服务 |
| `/portal/contact/` | Contact.vue | 联系我们 |

### study-tracker（hash 路由，根路径 /）

| 路由 | 功能 |
|------|------|
| `#home` | 首页 |
| `#today` | 今日学习 |
| `#calendar` | 日历档案 |
| `#stats` | 数据统计 |
| `#notes` | 笔记资料库 |
| `#search` | 检索查询 |
| `#tasks` | 计划任务 |
| `#backup` | 数据备份 |
| `#settings` | 设置 |

## 前端构建配置

### Vite 配置（vite.config.ts）

```typescript
export default defineConfig({
  plugins: [vue()],
  base: '/static/',                    // 静态资源路径前缀
  build: {
    assetsDir: 'portal/assets',         // 构建产物子目录
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/static': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
```

### Vue Router 配置（router/index.ts）

```typescript
const router = createRouter({
  history: createWebHistory('/portal/'),    // history 模式，base 路径
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/about', name: 'About', component: () => import('../views/About.vue') },
    { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
    { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
  ],
})
```

### Vue 组件图片路径

Vue 组件中的图片路径使用动态绑定，避免 Vite 解析：

```vue
<img :src="'/static/logo_icon.jpg'" alt="用功日志" />
```

## study-tracker 模块

位于 `frontend/study-tracker/`，技术栈为 HTML + Tailwind CSS + 原生 JavaScript。

study-tracker 已集成到 Django 中，通过根路径 `/` 直接访问。其 CSS/JS/图片资源通过 Django 静态文件系统 `/static/` 提供服务，API 调用使用相对路径 `/api`，自动适配当前域名。

### 功能说明

| 导航 | 功能描述 |
|------|----------|
| **首页 / 今日学习** | 当日学习记录快速录入、今日总时长、待完成学习任务、今日随笔入口 |
| **日历档案** | 日历热力图视图，按日期查看全部历史学习日志，按月切换复盘 |
| **数据统计** | 可视化图表：科目时长占比、月度趋势、连续打卡、分类分布 |
| **笔记资料库** | 知识点摘抄、错题笔记、自定义学习合集归档，支持全文搜索 |
| **检索查询** | 全局多条件筛选：科目、标签、关键词、时间段 |
| **计划任务** | 周/月学习规划、待办清单、阶段性目标打卡 |
| **数据备份** | 记录导入导出、批量备份、历史备份文件管理 |
| **设置** | 自定义科目标签、学习目标设置、配色自定义 |

## 前后端通信

### 开发环境

- **study-tracker**: API 地址为相对路径 `/api`，由 Django 统一服务，无需跨域配置
- **Vue 门户（独立开发模式）**: 通过 Vite 代理转发 `/api` 和 `/static` 请求到 Django 后端

### 生产环境

前后端在同一个域名下，由 Django + WhiteNoise + Gunicorn 统一服务，无跨域问题。

## 生产部署

### 部署架构

```
用户浏览器
    ↓ HTTPS
Render.com CDN
    ↓
Gunicorn (WSGI 服务器)
    ↓
Django 应用
    ├── /api/*          → DRF ViewSet (JSON API)
    ├── /static/*       → WhiteNoise (静态文件: study-tracker + Vue 构建产物)
    ├── /portal/        → Vue 门户首页 (SPA)
    ├── /portal/*       → Vue 门户子路由 (about/products/contact)
    ├── /admin/         → Django Admin (后台管理)
    └── /              → study-tracker (主应用前端页面)
    ↓
SQLite 数据库
```

### 环境变量

| 变量名 | 开发默认值 | 生产环境值 | 说明 |
|--------|-----------|-----------|------|
| `SECRET_KEY` | 硬编码(仅开发) | 自定义随机字符串 | Django 密钥 |
| `DEBUG` | `True` | `False` | 调试模式开关 |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | `*` 或具体域名 | 允许的访问域名 |

### 部署文件

| 文件 | 作用 |
|------|------|
| `Procfile` | 启动命令 `gunicorn corporate_site.wsgi:application` |
| `render.yaml` | Render.com 服务配置（构建命令含 npm install && npm run build） |
| `requirements.txt` | Python 依赖清单 |
| `.python-version` | Python 版本声明 |
| `frontend/dist/` | Vue 构建产物（已提交到 Git，部署时使用） |

### Git 仓库

- **远程地址**: `https://github.com/0311KenHuang/Study-Log.git`
- **分支**: `main`
- **Git 配置**: 用户名 `KenHuang`，邮箱 `3296651736@qq.com`
