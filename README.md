# 用功日志 · Study Log

> 记下每一段用功的时光 —— 一个轻量的全栈学习记录与追踪应用。

简单好用的线上学习日记本，随手记录当日学习状态、难点、完成任务，搭配数据统计看清学习规律，稳步调整学习节奏。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端 | Django 5.2 + Django REST Framework 3.17 | RESTful API 服务 |
| 数据库 | SQLite | 开发环境轻量存储 |
| 后台管理 | django-simpleui | 美化 Django Admin |
| 跨域处理 | django-cors-headers | 允许前端跨域访问 |
| 静态文件 | WhiteNoise | 生产环境静态文件服务 |
| 应用服务器 | Gunicorn | 生产环境 WSGI 服务器 |
| 门户前端 | Vue 3 + Vite + TypeScript | 企业官网风格展示页 |
| 应用前端 | 原生 HTML + Tailwind CSS | 学习记录核心功能界面 |
| 路由 | Vue Router / 原生 JS 路由 | 前端页面切换 |
| 部署平台 | Render.com | 免费自动部署 |

## 项目结构

```
企业官网开发实战/
├── corporate_site/          # Django 项目配置
│   ├── settings.py          # 项目设置(含 DRF / CORS / WhiteNoise / 环境变量配置)
│   ├── urls.py              # 根路由(admin + api + study-tracker 首页)
│   ├── wsgi.py / asgi.py    # 部署入口
│
├── main/                     # 核心业务 App
│   ├── models.py            # 7 张数据表(学习记录/笔记/任务/分类/目标/备份/搜索历史)
│   ├── views.py             # DRF ViewSet + 统计聚合接口
│   ├── serializers.py       # 序列化器
│   ├── urls.py              # API 路由注册
│   └── migrations/          # 数据库迁移文件
│
├── frontend/                 # 前端项目
│   ├── src/                  # Vue 3 门户前端
│   │   ├── views/           # 首页 / 关于 / 产品 / 联系
│   │   ├── router/          # 路由配置
│   │   └── App.vue
│   ├── study-tracker/        # 学习追踪应用(原生 JS + Tailwind)
│   │   ├── index.html       # 主页面(含 8 个功能模块)
│   │   ├── css/styles.css
│   │   └── js/
│   │       ├── app.js       # 应用入口
│   │       ├── router.js    # 前端路由
│   │       ├── pages.js     # 页面渲染逻辑
│   │       └── data.js      # 数据交互层(API 调用)
│   ├── vite.config.ts       # Vite 配置(含 /api 代理)
│   └── package.json
│
├── assets/                   # 品牌素材(Logo)
├── manage.py                 # Django 管理入口
├── requirements.txt          # Python 依赖清单
├── Procfile                  # 部署启动命令(Gunicorn)
├── render.yaml               # Render.com 部署配置
├── .python-version           # Python 版本声明
├── .gitignore                # Git 忽略规则
└── README.md                 # 本文件
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
- Node.js 18+(仅 Vue 门户开发时需要)
- Git

### 本地开发(推荐)

study-tracker 已集成到 Django 中，只需启动一个服务即可同时访问前端页面和 API：

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

启动后访问以下地址：

| 地址 | 说明 |
|------|------|
| `http://127.0.0.1:8000/` | 用功日志首页(study-tracker 前端) |
| `http://127.0.0.1:8000/api/` | REST API 接口 |
| `http://127.0.0.1:8000/admin/` | Django 后台管理(SimpleUI) |

### Vue 门户前端(独立开发时)

如需单独开发 Vue 门户页面：

```bash
cd frontend
npm install
npm run dev
```

Vue 门户运行在 `http://localhost:5173`，已配置 `/api` 代理到后端 8000 端口。

## 生产部署(Render.com)

本项目已配置好 Render.com 一键部署，支持自动构建和持续部署。

### 部署步骤

1. 将代码推送到 GitHub 仓库
2. 在 [render.com](https://render.com) 注册并连接 GitHub 账号
3. 创建 Web Service，选择本仓库
4. 配置项会从 `render.yaml` 自动读取：
   - **Build**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start**: `gunicorn corporate_site.wsgi:application`
5. 添加环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SECRET_KEY` | 自定义随机字符串 | Django 密钥 |
| `DEBUG` | `False` | 关闭调试模式 |
| `ALLOWED_HOSTS` | `*` | 允许的访问域名 |

6. 部署完成后获得公网地址，如 `https://study-log-xxxx.onrender.com`

### 部署架构

```
用户浏览器
    ↓ HTTPS
Render.com CDN
    ↓
Gunicorn (WSGI 服务器)
    ↓
Django 应用
    ├── /api/*        → DRF ViewSet (JSON API)
    ├── /static/*     → WhiteNoise (静态文件)
    ├── /admin/       → Django Admin (后台管理)
    └── /            → study-tracker (前端页面)
    ↓
SQLite 数据库
```

### 部署相关文件说明

| 文件 | 作用 |
|------|------|
| `Procfile` | 定义启动命令 `gunicorn corporate_site.wsgi:application` |
| `render.yaml` | Render.com 服务配置(构建命令、环境变量) |
| `requirements.txt` | Python 依赖清单(含 gunicorn、whitenoise) |
| `.python-version` | 声明 Python 版本 |
| `corporate_site/settings.py` | 支持环境变量配置 SECRET_KEY / DEBUG / ALLOWED_HOSTS |

### 免费层限制

- 服务在 15 分钟无访问后自动休眠，下次访问需等待 30-60 秒唤醒
- SQLite 数据库在重新部署时会重置(如需持久数据，建议升级 PostgreSQL)
- 每月 750 小时免费实例时间

## 开发说明

- 后端时区已设为 `Asia/Shanghai`，语言为简体中文
- CORS 已全局放行，方便前后端分离开发
- `DEBUG` 默认为 `True`(开发模式)，通过环境变量 `DEBUG=False` 切换生产模式
- `SECRET_KEY` 支持环境变量覆盖，生产环境务必设置
- `ALLOWED_HOSTS` 支持环境变量配置，默认 `localhost,127.0.0.1`
- study-tracker 的 API 地址使用相对路径 `/api`，自动适配任何域名
- 静态文件由 Django 统一管理，通过 `STATICFILES_DIRS` 注册 study-tracker 目录
- 生产环境使用 WhiteNoise 提供静态文件服务，无需 Nginx

## 许可证

本项目仅用于学习实践用途。
