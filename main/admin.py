from django.contrib import admin
from .models import (
    StudyRecord, StudyNote, StudyTask, StudyCategory,
    StudyGoal, StudyBackup, SearchHistory
)


@admin.register(StudyRecord)
class StudyRecordAdmin(admin.ModelAdmin):
    list_display = ('date', 'subject', 'category', 'duration', 'created_at')
    list_filter = ('category', 'date')
    search_fields = ('subject', 'content', 'category')
    date_hierarchy = 'date'
    list_per_page = 30


@admin.register(StudyNote)
class StudyNoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'tags', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content', 'tags')
    list_per_page = 30


@admin.register(StudyTask)
class StudyTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'due_date', 'completed', 'created_at')
    list_filter = ('priority', 'completed', 'due_date')
    search_fields = ('title', 'description')
    list_editable = ('completed', 'priority')
    list_per_page = 30


@admin.register(StudyCategory)
class StudyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'is_default', 'created_at')
    list_filter = ('is_default',)
    search_fields = ('name',)


@admin.register(StudyGoal)
class StudyGoalAdmin(admin.ModelAdmin):
    list_display = ('period', 'target_minutes', 'updated_at')
    list_editable = ('target_minutes',)


@admin.register(StudyBackup)
class StudyBackupAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_size', 'created_at')
    readonly_fields = ('name', 'data', 'file_size', 'created_at')
    list_per_page = 20


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('keyword', 'search_type', 'result_count', 'searched_at')
    list_filter = ('search_type', 'searched_at')
    search_fields = ('keyword',)
    readonly_fields = ('keyword', 'search_type', 'result_count', 'searched_at')
