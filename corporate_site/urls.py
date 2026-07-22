"""
URL configuration for corporate_site project.
"""
from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse

# study-tracker 首页路径
TRACKER_INDEX = Path(__file__).resolve().parent.parent / 'frontend' / 'study-tracker' / 'index.html'

# Vue 门户构建产物路径
PORTAL_INDEX = Path(__file__).resolve().parent.parent / 'frontend' / 'dist' / 'index.html'


def study_tracker_index(request):
    """提供 study-tracker 前端首页"""
    return HttpResponse(TRACKER_INDEX.read_text(encoding='utf-8'), content_type='text/html')


def portal_index(request):
    """提供 Vue 门户首页（SPA 入口）"""
    return HttpResponse(PORTAL_INDEX.read_text(encoding='utf-8'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('main.urls')),
    # study-tracker 首页（主应用）
    path('', study_tracker_index, name='index'),
    # Vue 门户首页
    path('portal/', portal_index, name='portal'),
    # Vue 门户子路由（about/products/contact 等 SPA 路由）
    re_path(r'^portal/.*/$', portal_index),
]
