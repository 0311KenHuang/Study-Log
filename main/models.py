from django.db import models


class StudyRecord(models.Model):
    """每日学习记录表 - 记录每次学习的详细信息"""

    PRIORITY_CHOICES = [
        ('high', '高'),
        ('medium', '中'),
        ('low', '低'),
    ]

    # 学习日期
    date = models.DateField(verbose_name='学习日期', db_index=True)
    # 学习主题/科目名称
    subject = models.CharField(max_length=200, verbose_name='学习主题')
    # 学习时长（分钟）
    duration = models.PositiveIntegerField(default=0, verbose_name='学习时长(分钟)')
    # 学习详细内容
    content = models.TextField(blank=True, default='', verbose_name='学习内容')
    # 学习分类
    category = models.CharField(max_length=50, default='其他', verbose_name='分类', db_index=True)
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'study_records'
        verbose_name = '学习记录'
        verbose_name_plural = '学习记录'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.date} - {self.subject} ({self.duration}分钟)'


class StudyNote(models.Model):
    """学习笔记表 - 知识点摘抄、错题笔记、学习合集"""

    # 笔记标题
    title = models.CharField(max_length=200, verbose_name='标题')
    # 笔记正文内容
    content = models.TextField(verbose_name='内容')
    # 标签（逗号分隔的字符串，如 "编程,JavaScript,前端"）
    tags = models.CharField(max_length=500, blank=True, default='', verbose_name='标签')
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    # 更新时间
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'study_notes'
        verbose_name = '学习笔记'
        verbose_name_plural = '学习笔记'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_tags_list(self):
        """将标签字符串转为列表"""
        return [t.strip() for t in self.tags.split(',') if t.strip()]


class StudyTask(models.Model):
    """学习计划任务表 - 周/月规划、待办清单、目标打卡"""

    PRIORITY_CHOICES = [
        ('high', '高'),
        ('medium', '中'),
        ('low', '低'),
    ]

    # 任务标题
    title = models.CharField(max_length=200, verbose_name='任务标题')
    # 任务描述
    description = models.TextField(blank=True, default='', verbose_name='任务描述')
    # 优先级
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name='优先级'
    )
    # 截止日期
    due_date = models.DateField(verbose_name='截止日期', db_index=True)
    # 是否完成
    completed = models.BooleanField(default=False, verbose_name='已完成')
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'study_tasks'
        verbose_name = '学习任务'
        verbose_name_plural = '学习任务'
        ordering = ['completed', 'due_date']

    def __str__(self):
        status = '✓' if self.completed else '○'
        return f'{status} {self.title}'


class StudyCategory(models.Model):
    """学习分类表 - 自定义科目与标签管理"""

    # 分类名称
    name = models.CharField(max_length=50, unique=True, verbose_name='分类名称')
    # 颜色标识（用于前端展示）
    color = models.CharField(max_length=20, blank=True, default='', verbose_name='颜色标识')
    # 是否为默认分类（默认分类不可删除）
    is_default = models.BooleanField(default=False, verbose_name='默认分类')
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'study_categories'
        verbose_name = '学习分类'
        verbose_name_plural = '学习分类'
        ordering = ['id']

    def __str__(self):
        return self.name


class StudyGoal(models.Model):
    """学习目标表 - 每日/每周/每月学习时长目标"""

    PERIOD_CHOICES = [
        ('daily', '每日'),
        ('weekly', '每周'),
        ('monthly', '每月'),
    ]

    # 目标周期
    period = models.CharField(
        max_length=10,
        choices=PERIOD_CHOICES,
        unique=True,
        verbose_name='目标周期'
    )
    # 目标时长（分钟）
    target_minutes = models.PositiveIntegerField(verbose_name='目标时长(分钟)')
    # 更新时间
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'study_goals'
        verbose_name = '学习目标'
        verbose_name_plural = '学习目标'

    def __str__(self):
        return f'{self.get_period_display()}目标 - {self.target_minutes}分钟'


class StudyBackup(models.Model):
    """数据备份记录表 - 历史备份文件管理"""

    # 备份名称
    name = models.CharField(max_length=200, verbose_name='备份名称')
    # 备份数据（JSON 格式字符串）
    data = models.TextField(verbose_name='备份数据')
    # 备份文件大小（字节）
    file_size = models.PositiveIntegerField(default=0, verbose_name='文件大小(字节)')
    # 创建时间
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'study_backups'
        verbose_name = '数据备份'
        verbose_name_plural = '数据备份'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.created_at.strftime("%Y-%m-%d %H:%M")})'


class SearchHistory(models.Model):
    """搜索历史记录表 - 记录用户的检索查询历史"""

    # 搜索关键词
    keyword = models.CharField(max_length=200, verbose_name='搜索关键词')
    # 搜索类型（all/records/notes/tasks）
    search_type = models.CharField(max_length=20, default='all', verbose_name='搜索类型')
    # 结果数量
    result_count = models.PositiveIntegerField(default=0, verbose_name='结果数量')
    # 搜索时间
    searched_at = models.DateTimeField(auto_now_add=True, verbose_name='搜索时间')

    class Meta:
        db_table = 'study_search_history'
        verbose_name = '搜索历史'
        verbose_name_plural = '搜索历史'
        ordering = ['-searched_at']

    def __str__(self):
        return f'搜索"{self.keyword}" - {self.result_count}条结果'
