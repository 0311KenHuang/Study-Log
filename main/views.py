"""
views.py - DRF 视图集
提供 CRUD API 接口 + 统计聚合接口
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import connection
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta

from .models import (
    StudyRecord, StudyNote, StudyTask, StudyCategory,
    StudyGoal, StudyBackup, SearchHistory
)
from .serializers import (
    StudyRecordSerializer, StudyNoteSerializer, StudyTaskSerializer,
    StudyCategorySerializer, StudyGoalSerializer, StudyBackupSerializer,
    SearchHistorySerializer
)


def _fresh_queryset(model, order_by=None):
    """每次请求都创建新 QuerySet，避免类属性缓存导致数据不同步"""
    connection.close()  # 关闭旧连接，强制下次使用新连接读取最新数据
    qs = model.objects.all()
    if order_by:
        qs = qs.order_by(*order_by) if isinstance(order_by, (list, tuple)) else qs.order_by(order_by)
    return qs


class StudyRecordViewSet(viewsets.ModelViewSet):
    """学习记录 ViewSet - 标准 CRUD + 统计扩展"""
    serializer_class = StudyRecordSerializer

    def get_queryset(self):
        qs = _fresh_queryset(StudyRecord, ['-date', '-created_at'])
        params = self.request.query_params
        if 'date' in params:
            qs = qs.filter(date=params['date'])
        if 'category' in params:
            qs = qs.filter(category=params['category'])
        if 'start_date' in params and 'end_date' in params:
            qs = qs.filter(date__gte=params['start_date'], date__lte=params['end_date'])
        return qs

    @action(detail=False, methods=['get'])
    def today(self, request):
        """获取今日记录 + 总时长"""
        today = datetime.now().date()
        records = self.get_queryset().filter(date=today)
        total = records.aggregate(s=Sum('duration'))['s'] or 0
        return Response({
            'records': StudyRecordSerializer(records, many=True).data,
            'total': total
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """学习统计概览：今日/本周/本月/连续打卡/分类分布"""
        connection.close()  # 强制新连接，避免读到旧缓存数据
        today = datetime.now().date()

        # 今日
        today_records = StudyRecord.objects.filter(date=today)
        today_total = today_records.aggregate(s=Sum('duration'))['s'] or 0

        # 本周（周一至今）
        weekday = today.weekday()
        monday = today - timedelta(days=weekday)
        week_records = StudyRecord.objects.filter(date__gte=monday, date__lte=today)
        week_total = week_records.aggregate(s=Sum('duration'))['s'] or 0

        # 本月
        month_start = today.replace(day=1)
        month_records = StudyRecord.objects.filter(date__gte=month_start, date__lte=today)
        month_total = month_records.aggregate(s=Sum('duration'))['s'] or 0

        # 连续打卡天数
        streak = 0
        check_date = today
        while StudyRecord.objects.filter(date=check_date).exists():
            streak += 1
            check_date -= timedelta(days=1)

        # 分类分布
        category_stats = list(
            StudyRecord.objects
            .values('category')
            .annotate(duration=Sum('duration'), count=Count('id'))
            .order_by('-duration')
        )

        # 近 N 天趋势
        days = int(request.query_params.get('days', 14))
        daily_trend = []
        for i in range(days - 1, -1, -1):
            d = today - timedelta(days=i)
            total = StudyRecord.objects.filter(date=d).aggregate(s=Sum('duration'))['s'] or 0
            daily_trend.append({'date': d.isoformat(), 'duration': total})

        return Response({
            'today_total': today_total,
            'week_total': week_total,
            'month_total': month_total,
            'streak': streak,
            'category_stats': category_stats,
            'daily_trend': daily_trend,
            'record_count': StudyRecord.objects.count(),
        })

    @action(detail=False, methods=['get'])
    def daily_stats(self, request):
        """近 N 天每日时长"""
        connection.close()  # 强制新连接，避免读到旧缓存数据
        days = int(request.query_params.get('days', 30))
        today = datetime.now().date()
        result = []
        for i in range(days - 1, -1, -1):
            d = today - timedelta(days=i)
            total = StudyRecord.objects.filter(date=d).aggregate(s=Sum('duration'))['s'] or 0
            result.append({'date': d.isoformat(), 'duration': total})
        return Response(result)


class StudyNoteViewSet(viewsets.ModelViewSet):
    """学习笔记 ViewSet"""
    serializer_class = StudyNoteSerializer

    def get_queryset(self):
        qs = _fresh_queryset(StudyNote, '-created_at')
        tag = self.request.query_params.get('tag')
        if tag:
            qs = qs.filter(tags__icontains=tag)
        return qs

    @action(detail=False, methods=['get'])
    def search(self, request):
        """全文搜索笔记"""
        connection.close()  # 强制新连接
        kw = request.query_params.get('q', '')
        if not kw:
            return Response([])
        qs = StudyNote.objects.filter(
            Q(title__icontains=kw) | Q(content__icontains=kw) | Q(tags__icontains=kw)
        )
        return Response(StudyNoteSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def all_tags(self, request):
        """获取所有标签"""
        connection.close()  # 强制新连接
        all_tags = set()
        for note in StudyNote.objects.exclude(tags=''):
            all_tags.update(note.get_tags_list())
        return Response(list(all_tags))


class StudyTaskViewSet(viewsets.ModelViewSet):
    """学习任务 ViewSet"""
    serializer_class = StudyTaskSerializer

    def get_queryset(self):
        qs = _fresh_queryset(StudyTask, ['completed', 'due_date'])
        params = self.request.query_params
        if 'completed' in params:
            qs = qs.filter(completed=params['completed'] == 'true')
        if 'priority' in params:
            qs = qs.filter(priority=params['priority'])
        if 'due_date' in params:
            qs = qs.filter(due_date=params['due_date'])
        return qs

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        """切换任务完成状态"""
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        return Response(StudyTaskSerializer(task).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """任务统计"""
        connection.close()  # 强制新连接
        return Response({
            'total': StudyTask.objects.count(),
            'completed': StudyTask.objects.filter(completed=True).count(),
            'pending': StudyTask.objects.filter(completed=False).count(),
        })


class StudyCategoryViewSet(viewsets.ModelViewSet):
    """学习分类 ViewSet"""
    serializer_class = StudyCategorySerializer

    def get_queryset(self):
        return _fresh_queryset(StudyCategory, 'id')


class StudyGoalViewSet(viewsets.ModelViewSet):
    """学习目标 ViewSet"""
    serializer_class = StudyGoalSerializer

    def get_queryset(self):
        return _fresh_queryset(StudyGoal)


class StudyBackupViewSet(viewsets.ModelViewSet):
    """数据备份 ViewSet"""
    serializer_class = StudyBackupSerializer

    def get_queryset(self):
        return _fresh_queryset(StudyBackup, '-created_at')


class SearchHistoryViewSet(viewsets.ModelViewSet):
    """搜索历史 ViewSet"""
    serializer_class = SearchHistorySerializer

    def get_queryset(self):
        return _fresh_queryset(SearchHistory, '-searched_at')
