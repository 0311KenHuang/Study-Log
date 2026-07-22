# 用功日志 · Study Log

> 记下每一段用功的时光 —— 一个轻量的全栈学习记录与追踪应用。

简单好用的线上学习日记本，随手记录当日学习状态、难点、完成任务，搭配数据统计看清学习规律，稳步调整学习节奏。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端 | Django 5.2 + Django REST Framework | RESTful API 服务 |
| 数据库 | SQLite | 开发环境轻量存储 |
| 后台管理 | django-simpleui | 美化 Django Admin |
| 跨域处理 | django-cors-headers | 允许前端跨域访问 |
| 门户前端 | Vue 3 + Vite + TypeScript | 企业官网风格展示页 |
| 应用前端 | 原生 HTML + Tailwind CSS | 学习记录核心功能界面 |
| 路由 | Vue Router / 原生 JS 路由 | 前端页面切换 |

## 项目结构

```
企业官网开发实战/
├── corporate_site/          # Django 项目配置
│   ├── settings.py          # 项目设置(含 DRF / CORS 配置)
│   ├── urls.py               # 根路由(admin + api)
│   ├── wsgi.py / asgi.py    # 部署入口
│
├── main/                     # 核心业务 App
│   ├── models.py            # 7 张数据表(学习记录/笔记/任务/分类/目标/备份/搜索历史)
│   ├── views.py             # DRF ViewSet + 统计聚合接口
│   ├── serializers.py       # 序列化器
│   ├── urls.py              # API 路由注册
│   └── migrations/          # 数据库迁移文件
│
├── frontend/                 # Vue 3 门户前端
│   ├── src/
│   │   ├── views/           # 首页 / 关于 / 产品 / 联系
│   │   ├── router/          # 路由配置
│   │   └── App.vue
│   ├── vite.config.ts       # Vite 配置(含 /api 代理)
│   └── package.json
│
│   └── study-tracker/        # 学习追踪应用(原生 JS + Tailwind)
│       ├── index.html       # 主页面(含 8 个功能模块)
│       ├── css/styles.css
│       └── js/
│           ├── app.js       # 应用入口
│           ├── router.js    # 前端路由
│           ├── pages.js     # 页面渲染逻辑
│           └── data.js      # 数据交互层
│
├── assets/                   # 品牌素材(Logo)
├── manage.py                # Django 管理入口
└── requirements.txt          # Python 依赖清单
```

## 核心功能

### 学习记录管理
- **今日学习** — 快速记录当日学习主题、时长、内容与分类
- **日历档案** — 按日期浏览历史学习记录
- **数据统计** — 今日 / 本周 / 本月时长汇总、连续打卡天数、分类分布、趋势图表

### 笔记与任务
- **笔记资料库** — 知识点摘抄、错题笔记，支持标签分类与全文搜索
- **计划任务** — 学习待办清单，支持优先级、截止日期、完成状态切换

### 数据管理
- **检索查询** — 跨记录 / 笔记 / 任务的统一搜索
- **数据备份** — 一键备份所有学习数据
- **分类管理** — 自定义学习分类与颜色标识
- **目标设置** — 每日 / 每周 / 每月学习时长目标

## API 接口概览

所有接口前缀为 `/api/`，基于 DRF ViewSet 自动生成：

| 端点 | 功能 | 自定义 Action |
|------|------|---------------|
| `/api/records/` | 学习记录 CRUD | `stats/`(统计概览)、`today/`(今日记录)、`daily_stats/`(每日趋势) |
| `/api/notes/` | 学习笔记 CRUD | `search/`(全文搜索)、`all_tags/`(所有标签) |
| `/api/tasks/` | 学习任务 CRUD | `toggle/`(切换完成)、`stats/`(任务统计) |
| `/api/categories/` | 学习分类 CRUD | |
| `/api/goals/` | 学习目标 CRUD | |
| `/api/backups/` | 数据备份 CRUD | |
| `/api/search-history/` | 搜索历史 CRUD | |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- Git

### 后端启动

```bash
# 1. 创建并激活虚拟环境
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 执行数据库迁移
python manage.py makemigrations
python manage.py migrate

# 4. 创建超级用户(可选，用于访问后台)
python manage.py createsuperuser

# 5. 启动开发服务器
python manage.py runserver
```

后端运行在 `http://127.0.0.1:8000`，后台管理位于 `/admin/`。

### 前端启动(Vue 门户)

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

Vue 门户运行在 `http://localhost:5173`，已配置 `/api` 代理到后端 8000 端口。

### 学习追踪应用(原生前端)

直接用浏览器打开 `frontend/study-tracker/index.html` 即可使用，或通过任意静态服务器托管。

## 开发说明

- 后端时区已设为 `Asia/Shanghai`，语言为简体中文
- CORS 已全局放行，方便前后端分离开发
- `DEBUG = True` 仅供开发使用，生产环境请关闭并配置 `ALLOWED_HOSTS`
- 生产环境请将 `SECRET_KEY` 改为环境变量读取，切勿硬编码

## 许可证

本项目仅用于学习实践用途。
