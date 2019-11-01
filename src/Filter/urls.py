from django.urls import include, path
from .views import Index

filter = Index()               # 主类，用于缓存数据

urlpatterns = [
    path('', filter.fetch),    # /filter
    path('get_next', filter.get_next),# 用于接收获取当前hash的请求
    path('confirm', filter.checked),  # 用于接收检查请求的路径
]
