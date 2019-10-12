from django.urls import include, path
from .views import Query, index

cache = Query()

urlpatterns = [
    path('', index),
    path('q', cache.search),                     # 查询条件 request
    path('show', cache.show_res),                # 展示结果页面
    path('confirm', cache.red_download)          # 确认打包 request
]
