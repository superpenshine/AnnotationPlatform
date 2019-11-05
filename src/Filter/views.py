from random import randint
from django.db.models import Q
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render

from Search.models import Annotation, Tags
import json

# filter 主入口 
class Index():
    def __init__(self, *args, **kwargs):
        super(Index, self).__init__(*args, **kwargs)
        self.im_url = '/media/'                                     # 图片访问路径
        # self.im_url = '/home/wwl/datasets_default/' 
        self.cache = None
        self.hash = ''
        
    # request 请求主入口
    def fetch(self, request):
        return render(request, 'Filter.html')                       # 默认跳转 /filter
 
    '''
    从数据库中通过hash检索annotation返还
    '''
    def get_next(self, request):
        self.cache = Annotation.objects.filter(
            Q(ano_type='pascal_voc'), 
            Q(check_state=0) | Q(check_state=4))
        free = self.cache.count()                                   # 需要检查的图片记录数量   
        data_decode_fail = True
        while data_decode_fail:
            im = self.cache.all()[randint(0, free-1)]               # 随机抽取一条记录
            _hash = im.hash
            rows = Annotation.objects.filter(hash=_hash)[0] 
            url = self.im_url+_hash+'.'+rows.format['image']        # 文件完整访问路径
            pscene = rows.project_scene 
            ptype = rows.project_type
            pname = rows.project
            size = rows.size
            tags = [i['tag_en'] for i in Tags.objects.filter(
                tag_id__in=rows.tags).values('tag_en') if i['tag_en'] != 'default']      # annotation 表中 tags 存储为 int[]，需要从 Tags 表中取出 int 对应的 tag_en 提高可读性
            # fixtag = ','.join(tags)                                                    # 取出的 tag_en 转换为 string 类型
            try:
                ano = decode(rows.ano)                                                   # 从 queryset 里取出标记信息，返回为 [{}] 类型
                fixitem = ','.join(
                    [v for i in ano for k, v in i.items() if k == 'name'])               # 从 ano 里取出 name 列表并显式转换为 string 类型
                
                data_decode_fail = False
            except Exception as e:
                print(e)
                continue

        context = {'project': pname, 
                    'scene':pscene, 
                    'type': ptype, 
                    'ano': ano, 
                    'url': url, 
                    'hash': _hash, 
                    'tags': tags, 
                    'width': size['width'], 
                    'height': size['height'], 
                    'free': free}

        return JsonResponse(context, safe=False)

    # 处理检查反馈的 request 
    def checked(self, request):
        # State: 0: untouched, 1: fixed, 2: require investigation, 3: marked, 4: wrong, 5: correct(final)
        try:
            entry = self.cache.get(hash=request.POST['hash'])
        except MultipleObjectsReturned:
            return HttpResponse(content="The case multiple unchecked entries with the same hash is not implemented.", status=501)
        except ObjectDoesNotExist:
            return HttpResponse(content="Request contains unknown hash.", status=400)
            
        entry.check_state = int(request.POST['state'])                                   # annotation 数据库更新
        # If fix exsists
        if request.POST.get('fix'):
            fix = json.loads(request.POST.get('fix'))
            entry.ano = encode(entry.ano, fix['ano'])
            entry.tag = fix['ano']['tags']

        # s.save()

        return self.get_next(request)

# 解析json并返回标注信息的列表
def decode(d):
    ano = []
    for v in d['annotation']['object']:
        name = v['name']
        for j, x in v['bndbox'].items():
            if j == 'xmax':
                xmax = x
            elif j == 'xmin':
                xmin = x
            elif j == 'ymax':
                ymax = x
            elif j == 'ymin':
                ymin = x
        ano.append({'name': name, 'xmin': xmin,
                    'xmax': xmax, 'ymin': ymin, 'ymax': ymax})
    return ano

# 将标注转换为数据库格式并存入(用data更新d)
'''
{'annotation': {'owner': {'name': '唵嘛呢叭咪吽', 'flickrid': 'Fried Camels'}, 'object': [{'name': 'wordh', 'bndbox': {'xmax': '697', 'xmin': '655', 'ymax': '1204', 'ymin': '1168'}}, {'name': 'numhl', 'bndbox': {'xmax': '785', 'xmin': '704', 'ymax': '1236', 'ymin': '1181'}}, {'name': 'numhs', 'bndbox': {'xmax': '753', 'xmin': '707', 'ymax': '1253', 'ymin': '1214'}}]}}
'''
def encode(old, data):
    obj = []
    for ano in data: 
        obj.append({'name': ano['name'], 
                    'bndbox': {'xmin': ano['xmin'], 
                                'xmax': ano['xmax'], 
                                'ymin': ano['ymin'], 
                                'ymax': ano['ymax']}})
    old['annotation']['object'] = obj;

    return old


