from django.shortcuts import render
from .unpack import run
# Create your views here.
from threading import Thread


# 上传主入口
def upload(request):
    if 'file' in request.GET:
        url = request.GET['file']
        task = Thread(target=run, args=(url,))
        task.start()
        return render(request, 'info.html', {"msg": "unpacking now"})
    else:
        return render(request, 'upload.html', {})
