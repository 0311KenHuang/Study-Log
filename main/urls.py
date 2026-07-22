"""
main/urls.py - API 路由注册
"""
from rest_framework.routers import DefaultRouter
from .views import (
    StudyRecordViewSet, StudyNoteViewSet, StudyTaskViewSet,
    StudyCategoryViewSet, StudyGoalViewSet, StudyBackupViewSet,
    SearchHistoryViewSet
)

router = DefaultRouter()
router.register(r'records', StudyRecordViewSet, basename='record')
router.register(r'notes', StudyNoteViewSet, basename='note')
router.register(r'tasks', StudyTaskViewSet, basename='task')
router.register(r'categories', StudyCategoryViewSet, basename='category')
router.register(r'goals', StudyGoalViewSet, basename='goal')
router.register(r'backups', StudyBackupViewSet, basename='backup')
router.register(r'search-history', SearchHistoryViewSet, basename='search-history')

urlpatterns = router.urls
