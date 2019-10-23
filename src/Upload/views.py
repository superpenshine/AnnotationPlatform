from .unpack import run
# Create your views here.
from threading import Thread
from django.http import HttpResponse
from django.shortcuts import render


# 上传主入口
def upload(request):
    if 'url' in request.POST or 'email' in request.POST:
        if request.POST.get('url') is not '' and request.POST.get('email'):
            url = request.POST['url']
            email = request.POST['email']

            task = Thread(target=run, args=(url, email))
            task.start()
            return HttpResponse(content='You will be notified via email when it is done!', status=200)
        else:
            return HttpResponse(content='Invalid URL or Email address.', status=400)
        # return render(request, 'info.html', {"msg": "unpacking now"})
    else:
        return render(request, 'upload.html', {})
