"""
URL configuration for corporate_site project.
"""
from pathlib import Path
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# study-tracker 首页路径
TRACKER_INDEX = Path(__file__).resolve().parent.parent / 'frontend' / 'study-tracker' / 'index.html'


def study_tracker_index(request):
    """提供 study-tracker 前端首页"""
    return HttpResponse(TRACKER_INDEX.read_text(encoding='utf-8'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('main.urls')),
    # study-tracker 首页
    path('', study_tracker_index, name='index'),
]
