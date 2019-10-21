"""WellDB URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),                                           # django 管理页面
    path('search/', include('Search.urls')),                                   # 搜索和展示结果页面
    path('download/', include('Download.urls')),                               # 从展示结果界面request到打包路径，一般不可直接访问
    path('upload/', include('Upload.urls')),                                   # 上传功能
    path('filter/', include('Filter.urls')),                                   # 数据检查和修正
    path('', include('Login.urls'))                                            # 主页和用户管理
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)              # dev 模式的静态图片管理，在 product模式下请关闭并使用nginx