from django.urls import path
from .views import down

urlpatterns = [
    path('', down)
]
