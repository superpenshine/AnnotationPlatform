from django.shortcuts import render
from .tasks import run
from threading import Thread
# Create your views here.

# 集中处理请求
def down(request):
    get = request.GET['mail']
    mail = dict(to=get+'@westwell-lab.com', id=get)
    task = Thread(target=run, args=(mail['to'], mail['id'], request.GET['q']))
    task.start()
    return render(request, 'info.html', {'msg': 'it will send an email when it\'s done'})        # info 会统一转到 info.html 页面
