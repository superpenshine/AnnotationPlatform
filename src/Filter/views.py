from random import randint

from django.db.models import Q
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render

from Search.models import Annotation, Tags

# filter 主入口 
class Index():
    def __init__(self, *args, **kwargs):
        super(Index, self).__init__(*args, **kwargs)
        self.im_url = '/media/'                                     # 图片访问路径
        # self.im_url = '/home/wwl/datasets_default/' 
        self.cache = Annotation.objects.filter(
            Q(check_state=0) & Q(ano_type='pascal_voc'))            # 未检查的图片数据库缓存  
        self.hash = ''
        self.len = Annotation.objects.all().count()                 # 数据库总条数
        
    # request 请求主入口
    def fetch(self, request):
        free = self.cache.count()                                   # 需要检查的图片记录数量   
        data_decode_fail = True
        while data_decode_fail:
            im = self.cache.all()[randint(0, free-1)]               # 随机抽取一条记录
            self.hash = im.hash
            ano_for = Annotation.objects.filter(hash=im.hash)       # 取出标签 
            get_im = self.im_url+im.hash+'.jpg'                     # 文件完整访问路径 
            import pdb
            pdb.set_trace()
            ano_for = ano_for[0]                                    # ano_for is list typed obj
            scene = ano_for.project_scene 
            ptype = ano_for.project_type
            prj = ano_for.project
            size = ano_for.size
            tags = [i['tag_en'] for i in Tags.objects.filter(
                tag_id__in=ano_for.tags).values('tag_en') if i['tag_en'] != 'default']      # annotation 表中 tags 存储为 int[]，需要从 Tags 表中取出 int 对应的 tag_en 提高可读性
            fixtag = ','.join(tags)                                                         # 取出的 tag_en 转换为 string 类型
            if int(size['width']) <= 80 or int(size['height']) <= 80:                       # 图片长或宽小于80px 则在大图旁边显示原图，方便查看
                display = ''
            else:
                display = "display:none;"                                                   # css 设置隐藏属性
            try:
                ano = decode(ano_for.ano)                                                   # 从 queryset 里取出标记信息，返回为 [{}] 类型
                fixitem = ','.join(
                    [v for i in ano for k, v in i.items() if k == 'name'])                  # 从 ano 里取出 name 列表并显式转换为 string 类型
                
                data_decode_fail = False
            except Exception as e:
                print(e)
                continue
            context = {'url': get_im,
                       'scene': scene,
                       'ptype': ptype,
                       'prj': prj,
                       'item': ano,                                                         # 用于前端显示标注信息
                       'free': free,                                                        # 剩余需要检查的图片数量
                       'width': size['width'],                                              # 原图 width     用于canvas缩放
                       'height': size['height'],                                            # 原图 height    同上
                       'display': display,                                                  # 是否显示原图
                       'tags': tags,                                                        # 原始 tag_en，类型为 list
                       'fixitem': fixitem,                                                  # 转换为 string 类型的 name 列表
                       'fixtag': fixtag,                                                    # 转换为 string 类型的 tag_en 列表
                       'imhash': im.hash}                                                   # 图片 hash，用于不同页面的参数传递和同步 

        if 'state' in request.GET:
            return redirect(f'/filter/confirm?h={self.hash}&state={request.GET["state"]}')  # 如果有检查反馈的 rquest 则跳转 checked 函数处理
        else:
            return render(request, 'Filter.html', context)                                  # 默认跳转 /filter

# 处理检查反馈的 request 
def checked(request):
    if request.GET['state'] != '0':                                                         # check_state 分为 4 个状态，0 代表待检查， 1 代表正确， 2 代表有明显错误， 3 代表不确定需要进一步人工检查 
        s = Annotation.objects.get(
            hash=request.GET['h'])
        s.check_state = int(request.GET['state'])                                           # annotation 数据库更新
        s.save()
    else:
        pass
    return redirect('/filter')                                                              # 默认跳转 /filter


# 处理修正的request
def fix(request):
    ah = request.POST['ahash']                                                              # 从 form 获取 ahash 作为判断同一张图的依据
    if ',' in request.POST['fixlabel']:    
        labels = request.POST['fixlabel'].split(',')                                        # 获取最新的 label 字符串并显式转换为列表
    else:
        labels = list(request.POST['fixlabel'])                                             # 如果 label 只有一个则转换为单一元素的列表
    tags = request.POST['fixtag'].split(',')
    save_tags = [int(i['tag_id'])
                 for i in Tags.objects.filter(tag_en__in=tags).values('tag_id')]            # 将传入的 tag_en 列表转换为  annotation 表一致的 int[] 类型
    old_ano = Annotation.objects.filter(hash=ah)                                            # 提出旧标注信息，后续分离标注座标
    
    new_ano = {'annotation': {'object': []}} 
    for v in old_ano:
        for k in v.ano['annotation']['object']:
            for i in labels:
                new_ano['annotation']['object'].append(                                     # 将新的标注 name 和旧标注座标合并
                    {'name': i, 'bndbox': k['bndbox']}) 
        v.tags = save_tags                                                                  # 更新tags
        v.ano = new_ano                                                                     # 更新标注
        v.save()
    return redirect('/filter')

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
