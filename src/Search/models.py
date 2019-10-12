from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models
from django.utils import timezone
# Create your models here.

# 主表
class Annotation(models.Model):

    hash = models.CharField(max_length=64, null=False)
    size = JSONField()
    format = JSONField()
    project_scene = models.CharField(max_length=32)
    project_type = models.CharField(max_length=32)
    project = models.CharField(max_length=32)
    ano_type = models.CharField(max_length=16, default='pascal_voc')
    ano = JSONField()
    tags = ArrayField(models.TextField(), blank=True)
    time_add = models.DateField(default=timezone.now().date())
    check_state = models.IntegerField(default=0)

    class Meta:
        db_table = 'annotation'

# tag表
class Tags(models.Model):
    tag_class = models.CharField(max_length=32)
    tag_en = models.CharField(max_length=32)
    tag_id = models.CharField(max_length=8)

    class Meta:
        db_table = 'tags'

#存取队列表
class Queue(models.Model):
    mail = models.CharField(max_length=32, null=False)
    task_list = ArrayField(models.IntegerField(), blank=False, null=False)

    class Meta:
        db_table = 'queue'

