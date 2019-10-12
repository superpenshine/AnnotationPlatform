from django.urls import include, path
from .views import Index, checked, fix

filter = Index()               # 主类，用于缓存数据

urlpatterns = [
    path('', filter.fetch),    # /filter
    path('confirm', checked),  # 用于接收检查请求的路径
    path('fix', fix)           # 用于接收修正请求的路径
]
