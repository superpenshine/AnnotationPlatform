
from django.contrib.postgres.fields import ArrayField, JSONField
from django.db import models
from django.utils import timezone

# 上传 test 表
class AnoTest(models.Model):
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
    check = models.IntegerField(default=0)

    class Meta:
        db_table = 'annotation_test'
