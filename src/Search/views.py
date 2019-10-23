import urllib
import logging

from .models import Annotation, Queue, Tags
from datetime import datetime
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect, render
from django.core.paginator import Paginator

# Create your views here.

# 主入口
def index(request):
    hints = get_hints()

    # List to string. Ex: ['1', '2'] => '1,2'
    for i in range(len(hints['tags'])):
        # tags_l = hints['tags'][i]
        tags_str = ','.join(map(str, hints['tags'][i]))
        hints['tags'][i] = tags_str
    return render(request, 'search.html', hints)

# Updae dropdown options
def update_opts(request):
    hints = get_hints(list(request.POST.items()))
    return JsonResponse(hints, safe=False)

# Show available options in dropdown list
def get_hints(cond=None):
    # Apply condition if given
    objects = Annotation.objects.all();
    if cond:
        objects = select(objects, cond)
    scenes = objects.values('project_scene').distinct()
    scenes = [x['project_scene'] for x in scenes]
    scenes.insert(0, '*')
    projects = objects.values('project').distinct()
    projects = [x['project'] for x in projects]
    projects.insert(0, '*')
    types = objects.values('project_type').distinct()
    types = [x['project_type'] for x in types]
    types.insert(0, '*')
    tags = objects.values('tags').distinct()
    tags = [x['tags'] for x in tags]
    tags.insert(0, '*')
    return {'scenes':scenes, 'projects':projects, 'types':types, 'tags':tags}

# Select entries with condition
def select(data, cond):
    for k, v in cond:
        if not v or v == '*':
            continue
        if k == 'scene':                                                                       
            data = data.filter(project_scene=v)                                              
        elif k == 'project':
            data = data.filter(project=v)
        elif k == 'type':
            data = data.filter(project_type=v)
        elif k == 'daterange':                                                                  # 在时间范围内搜索（包括前后时间）
            earlier = v.split('-')[0].strip()
            later = v.split('-')[1].strip()
            data = data.filter(
                time_add__gte=datetime.strptime(earlier, '%m/%d/%Y')).filter(
                time_add__lte=datetime.strptime(later, '%m/%d/%Y'))
        elif k == 'tags':                                                                       # 逗号分隔的 tag_en 必须要存在于 Tags 表中
            t = v.split(',')
            # ids = [i.id for i in Tags.objects.filter(tag_en=k) if k in t]
            # data = data.filter(tags__contains=ids)          
            data = data.filter(tags__contains=t)             
        else:
            print(f"INFO: Undefined parameter: {k}, value: {v}")
            continue
    return data

# 主类 用于request处理函数之间互用缓存 ps: 在这里没有问题，download 使用类做缓存就会报错，暂时无解
class Query():
    def __init__(self):
        self.cache = Annotation.objects.all()                                                      # 缓存
        self.q = ''                                                                                # 查询条件缓存
        self.req = []

    # 搜索条件过滤以及查找
    def search(self, request):
        CACHE = self.cache
        search_dict = {}
        q = request.POST['q']
        if q != '':
            query = q.split(' ')
            query = list(
                map(lambda x: {x.split(':')[0].strip(): x.split(":")[1].strip()}, query))          # 以冒号分隔关键词和 value，并存入 search_dict
            for b in query:
                search_dict.update(b) 
        else:
            return redirect('/search')

        for k, v in search_dict.items():                                                           # 根据关键词搜索
            if k == 'scene':                                                                       
                CACHE = CACHE.filter(project_scene=v)                                              
            elif k == 'project':
                CACHE = CACHE.filter(project=v)
            elif k == 'type':
                CACHE = CACHE.filter(project_type=v)
            elif k == 'time':                                                                       # time 形如 2019-08-01
                CACHE = CACHE.filter(
                    time_add__date=datetime.strptime(v, '%Y-%m-%d'))
            elif k == 'time_year':                                                                  # 只搜索年份
                CACHE = CACHE.filter(
                    time_add__year=v)
            elif k == 'time_and_after':                                                             # 搜索当前时间后（包括当前时间）
                CACHE = CACHE.filter(
                    time_add__gte=datetime.strptime(v, '%Y-%m-%d'))
            elif k == 'time_after':                                                                 # 搜索当前时间前（不包括当前时间）
                CACHE = CACHE.filter(
                    time_add__gt=datetime.strptime(v, '%Y-%m-%d'))
            elif k == 'time_and_before':                                                            # 同上
                CACHE = CACHE.filter(
                    time_add__lte=datetime.strptime(v, '%Y-%m-%d'))
            elif k == 'time_before':                                                                # 同上
                CACHE = CACHE.filter(
                    time_add__lt=datetime.strptime(v, '%Y-%m-%d'))
            elif k == 'tags':                                                                       # 逗号分隔的 tag_en 必须要存在于 Tags 表中
                t = v.split(',')
                ids = [i.id for i in Tags.objects.filter(tag_en=k) if k in t]
                CACHE = CACHE.filter(tags__contains=list(ids))                       
            else:
                return redirect('/search')
        self.cache = CACHE
        q_encode = urllib.parse.urlencode({'q': q})                                                # 解码搜索条件，方便之后发送文本格式的邮件
        self.q = q_encode
        return redirect(f'/search/show')                                                           # 跳转结果展示页面

    # 展示查询结果（分页）
    def search_with_cond(self, request):
        CACHE = Annotation.objects.all()
        req_lst = list(request.POST.items())
        self.req = ' '.join([f"{req[0]}:{req[1]}" for req in req_lst][1:])
        self.cache = select(CACHE, req_lst)
        return redirect(f'/search/show_page?page=1')

    # 展示查询结果（分页）
    def show_res(self, request):
        CACHE = self.cache
        res = CACHE.filter(ano_type='pascal_voc').order_by('id')                                   # 取出搜索结果
        pag = Paginator(res, 10)                                                                   # 分页展示，每页取10个结果，可调整
        page = request.GET.get('page')
        data = pag.get_page(page)                                                                  # 获取每一页的结果
        context = {'total': res.count(), 'data': data}          
        return render(request, 'show_search_res.html', context)

    # 按页展示查询结果
    # data field example: [{}, {}, {}]
    def show_page(self, request):
        CACHE = self.cache
        res = CACHE.filter(ano_type='pascal_voc').order_by('id')                                   # 取出搜索结果
        n_res = res.count()
        pag = Paginator(res, 10)                                                                   # 分页展示，每页取10个结果，可调整
        page = request.GET.get('page')
        # Construct data field
        if int(page) > pag.num_pages:
            page = pag.num_pages
        data = pag.get_page(page)                                                                  # 获取每一页的结果
        data = self.page_to_dict(data)
        context = {'total': n_res, 'data': data, 'page': page}
        return JsonResponse(context, safe=False)

    # 将pagenator数据转化为dict
    def page_to_dict(self, data):
        # Construct data field if there's data
        if len(data) == 0:
            return {}
        fields = [f.name for f in data[0]._meta.fields]
        data_l = []
        for row in range(min(10, len(data))):
            row_d = {}
            for attr in fields:
                row_d[attr] = getattr(data[row], attr)
            data_l.append(row_d)
        return data_l

    # 跳转打包路径
    def red_download(self, request):
        if self.q:
            q = self.q
            CACHE = self.cache
            caches = CACHE.filter(ano_type='pascal_voc')                                           # 限制打包的标注格式只能式pascal_voc
            ids = [str(i.id) for i in caches]                                                      # 取出待打包的 id 列表
            Queue.objects.create(mail=request.GET['mail'], task_list=list(ids))                    # 把 id 列表存入队列

            return redirect(f'/download?mail={request.GET["mail"]}&{q}')
        else:
            print('q is null')

    # 下载
    def dl(self, request):
        if self.req:
            mail = request.POST.get('mail')
            unchecked = request.POST.get('unchecked')
            CACHE = self.cache
            # CACHE = CACHE.filter(ano_type='pascal_voc')                                           # 限制打包的标注格式只能式pascal_voc
            ids = [str(i.id) for i in CACHE]
            ids = list(set(ids) - set(unchecked))
            Queue.objects.create(mail=mail, task_list=ids)                    # 把 id 列表存入队列
            req_dict = "req="+self.req
            return redirect(f'/download?mail={mail}&{req_dict}')
        else:
            return HttpResponse(content='To use the download function, you must make a search query first!', status=400)
            
