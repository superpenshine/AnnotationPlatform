from django.urls import include, path
from .views import Query, index, update_opts

cache = Query()

urlpatterns = [
    path('', index),
    path('update_opts', update_opts),            # 更新dropdown list选项
    path('q', cache.search),                     # 查询条件 request
    path('show', cache.show_res),                # 展示结果页面
    path('show_page', cache.show_page),          # 展示指定结果页面(from either search_with_cond or AJAX call)
    path('search_with_cond', cache.search_with_cond), # 展示搜索结果第一面(from AJAX call)
    path('confirm', cache.red_download),         # 确认打包 request
    path('get_options', cache.get_options)       # 查询可用下拉菜单选项
]
