"""
serializers.py - DRF 序列化器
将 Django 模型转换为 JSON，供前端 API 调用
"""
from rest_framework import serializers
from .models import (
    StudyRecord, StudyNote, StudyTask, StudyCategory,
    StudyGoal, StudyBackup, SearchHistory
)


class StudyRecordSerializer(serializers.ModelSerializer):
    """学习记录序列化器"""

    class Meta:
        model = StudyRecord
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class StudyNoteSerializer(serializers.ModelSerializer):
    """学习笔记序列化器"""
    # 虚拟字段：标签列表（方便前端使用）
    tags_list = serializers.SerializerMethodField()

    class Meta:
        model = StudyNote
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_tags_list(self, obj):
        return obj.get_tags_list()


class StudyTaskSerializer(serializers.ModelSerializer):
    """学习任务序列化器"""

    class Meta:
        model = StudyTask
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class StudyCategorySerializer(serializers.ModelSerializer):
    """学习分类序列化器"""

    class Meta:
        model = StudyCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class StudyGoalSerializer(serializers.ModelSerializer):
    """学习目标序列化器"""

    class Meta:
        model = StudyGoal
        fields = '__all__'
        read_only_fields = ('id', 'updated_at')


class StudyBackupSerializer(serializers.ModelSerializer):
    """数据备份序列化器"""

    class Meta:
        model = StudyBackup
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class SearchHistorySerializer(serializers.ModelSerializer):
    """搜索历史序列化器"""

    class Meta:
        model = SearchHistory
        fields = '__all__'
        read_only_fields = ('id', 'searched_at')
