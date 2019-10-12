import json
import os
import shutil
import xml.etree.ElementTree as et
from Search.models import Tags
from .models import AnoTest
import dhash
from PIL import Image
from tempfile import mkdtemp
from threading import Thread
from tqdm import tqdm

# 解析 xml 文件，取出 size 和 objects
def read_XML(file):
    tree = et.parse(file)
    root = tree.getroot()
    s = root.find('img_size')
    size = {'width': s.find('width').text, 'height': s.find(
        'height').text, 'depth': '3'}                                          # 默认 depth 为 3
    objs = []
    for obj in root.findall('object'):
        name = obj.find('name').text
        bndbox = obj.find('bndbox')
        xmin = bndbox.find('xmin').text
        ymin = bndbox.find('ymin').text
        xmax = bndbox.find('xmax').text
        ymax = bndbox.find('ymax').text
        objs.append({'name': name, 'xmin': xmin,
                     'ymin': ymin, 'xmax': xmax, 'ymax': ymax})
    return size, objs



def unarchive(file, dst):
    if file.endswith('.tar.gz'):
        shutil.unpack_archive(file, dst, 'gztar')
    elif file.endswith('.zip'):
        shutil.unpack_archive(file, dst, 'zip')
    else:
        return
    return

# 从文件夹命名解析出 label   exp: gate_plate-num_daxie_2018-01-01_night_double 
def read_Prj(folder):
    f = folder.split('_')
    if len(f) == 4:
        return {'project_scene': f[0], 'project_type': f[1], 'project': f[2], 'time_add': f[3]}
    elif len(f) > 4:
        return {'project_scene': f[0], 'project_type': f[1], 'project': f[2], 'time_add': f[3], 'tags': f[4:]}
    else:
        return

# 图片和xml 重命名，使用 https://github.com/Jetsetter/dhash 库
def rename(d):
    for root, dirs, files in os.walk(d):
        for f in tqdm(files):
            if f.endswith('.jpg'):
                img_fpath = os.path.join(root, f)
                try:
                    im = Image.open(img_fpath)
                    row, col = dhash.dhash_row_col(im)                         # 计算16进制hash           
                    hash1 = dhash.format_hex(row, col)                         # 把hash转换为string类型
                except IOError as e:
                    print(e)

                if f == (str(hash1)+'.jpg'):
                    pass

                else:
                    os.rename(img_fpath, os.path.join(root, str(hash1)+'.jpg'))
                    p = os.path.join(os.path.dirname(root), 'Annotations')
                    try:
                        os.rename(os.path.join(
                            p, f[:-4]+'.xml'), os.path.join(p, str(hash1)+'.xml'))

                    except OSError as e:
                        print(e)

# 主要解压函数
# url: NAS上压缩包的存放地址 分享链接默认开头带 / 
def run(url):
    dst = mkdtemp()                                                            # 建立临时文件夹 在/tmp目录下
    os.system(
        f'sshpass -p "westwell123" rsync -azvP junhong@192.168.105.19:/volume1{url} {dst}') 
    filename = url.split('/')[-1]
    name = os.path.basename(filename).split('.')[0]                            # 取文件名，和打包文件夹命名格式一致 exp: gate_plate-num_daxie_2018-01-01_night_double.tar.gz
    print('unarchiving file', name)                                            
    unarchive(os.path.join(dst, filename), os.path.join(dst, name))            # 解压到临时目录
    ano_path = os.path.join(f'{dst}/{name}', 'Annotations')
    img_path = os.path.join(f'{dst}/{name}', 'JPEGImages')

    task = Thread(target=rename, args=(dst,))                                  # 多线程方式进行重命名
    task.start()
    task.join()

    for im in os.listdir(img_path):                               
        size, objs = read_XML(os.path.join(ano_path, im[:-4]+'.xml'))
        ano = {'annotation': {'objects': objs}}
        formats = {'image': 'jpg'}
        prj = read_Prj(name)                                                   # 从文件夹名字取出label
        if prj is not None and len(prj) > 4:
            tag_ids = [i.tag_id for i in Tags.objects.filter(tag_en__in=prj['tags'])]       # 查询tag的id，返回列表类型
        else:
            tag_ids = []
        
        # 创建记录
        AnoTest.objects.create(hash=im[:-4], size=size, format=formats, ano_type='pascal_voc', ano=ano,
                               project_scene=prj['project_scene'], project_type=prj['project_type'], project=prj['project'], time_add=prj['time_add'], tags=tag_ids)

    shutil.rmtree(dst)                                                         # 删除临时文件夹
