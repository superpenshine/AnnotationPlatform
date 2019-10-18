from django.shortcuts import render
from .tasks import run
from threading import Thread
from django.http import JsonResponse, HttpResponse
# Create your views here.

# 集中处理请求
def down(request):
    mail_addr = request.GET['mail']
    try:
        id, _ = mail_addr.split('@')
    except ValueError:
        return HttpResponse(content='Your email address is not right. Example: abc@def.com', status=400)
    # task = Thread(target=run, args=(mail['to'], mail['id'], request.GET['q']))
    task = Thread(target=run, args=(mail_addr, id, request.GET.get('req')))
    task.start()
    return render(request, 'info.html', {'msg': 'it will send an email when it\'s done'})        # info 会统一转到 info.html 页面
