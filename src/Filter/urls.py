from django.urls import include, path
from .views import Index, checked, fix, get_info

filter = Index()               # 主类，用于缓存数据

urlpatterns = [
    path('', filter.fetch),    # /filter
    path('get_info', get_info),# 用于接收获取当前hash的请求
    path('confirm', checked),  # 用于接收检查请求的路径
    path('fix', fix)           # 用于接收修正请求的路径
]
