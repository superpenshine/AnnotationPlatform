import json
import os
import shutil
import xml.etree.ElementTree as et
import dhash
from PIL import Image
from tqdm import tqdm
from .models import AnoTest
from .parser import parse_date, guess_ano_folder, guess_img_folder
from tempfile import mkdtemp
from threading import Thread
from Search.models import Tags
from Download.tasks import send_mail

# 解析 xml 文件，取出 size, objects 和 image format
def read_XML(file):
    tree = et.parse(file)
    root = tree.getroot()

    # Find image format
    f_name = root.find('filename').text
    img_format = f_name.split('.')[-1]

    # Find size
    # s = root.find('img_size')
    s = root.find('size')
    size = {'width': s.find('width').text, 'height': s.find(
        'height').text, 'depth': '3'}                                          # 默认 depth 为 3
    # Find objects
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

    return img_format, size, objs

# 解压压缩文件至指定路径
def unarchive(file, dst):
    if file.endswith('.tar.gz'):
        shutil.unpack_archive(file, dst, 'gztar')
    elif file.endswith('.zip'):
        shutil.unpack_archive(file, dst, 'zip')
    else:
        print(f"INFO: No valid format found with file {file}")
        return

    return

# 从文件夹命名解析出 label   范例压缩文件: gate_plate-num_daxie_2018-01-01_night_double 
def read_Prj(folder):
    f = folder.split('_')
    # Need to verify the time format
    time_added = parse_date(f[3])

    if len(f) == 4:
        return {'project_scene': f[0], 'project_type': f[1], 'project': f[2], 'time_add': time_added}
    elif len(f) > 4:
        return {'project_scene': f[0], 'project_type': f[1], 'project': f[2], 'time_add': time_added, 'tags': f[4:]}
    else:
        return

# 图片和xml 重命名，使用 https://github.com/Jetsetter/dhash 库生成hash值
# d:临时目录
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

                    possible_ano_folder = ['annotation', 'annotations']
                    i = 0
                    p = os.path.join(os.path.dirname(root), 'Annotations')
                    while not os.path.exists(p):
                        p = os.path.join(os.path.dirname(root), possible_ano_folder[i])
                        i += 1
                        if i > len(possible_ano_folder) - 1:
                            raise ValueError("Unknown annotaiton folder name, all possible folder name tried.")

                    try:
                        os.rename(os.path.join(
                            p, f[:-4]+'.xml'), os.path.join(p, str(hash1)+'.xml'))

                    except OSError as e:
                        print(e)


'''
数据库查重
如果project与图片hash匹配， 认为重复
'''
def has_dup(_proj, _hash):
    if (AnoTest.objects.filter(project=_proj).filter(hash=_hash).count()) > 0:
        return True

    return False


# 主要解压函数
''' 
url: NAS上压缩包的存放路径或单个文件路径 分享链接默认开头带/ 
email: 完成upload时向用户提供的email地址发送notification
folder_n: 用户给出NAS上的文件夹名。 例如：container-suokong
cp_fnames: 同一project下所有压缩包名 ex: ['scene1_type1_project1_20191022_lengcang_kuangjia.tar.gz', 'scene2_type2_project2_20191022_lengcang_kuangjia.tar.gz']
base_n: project路径下不同压缩包名

tmp临时解压路径示例：
    url提供单个文件名： /WellOcean_Data/Picture/label/Ahj_fix_label/container-suokong/gate-suokong-qingdao-left_20190202.tar.gz
                /tmp
                    /tmpjda26x1u/
                        gate-suokong-qingdao-left_20190202/                    # 用压缩包名当作project名
                            gate-suokong-qingdao-left_20190202/                
                                Annotations                                    
                                JPEGImages
    url提供文件夹路径: /WellOcean_Data/Picture/label/Ahj_fix_label/container-suokong
                /tmp
                    /tmpjda26x1u/
                        container-suokong/                                     # 提取文件夹名当作project名
                            gate-suokong-qingdao-left_20190202/                
                                Annotations                                    
                                JPEGImages
'''
def run(url, email):
    tmp = mkdtemp()                                                            # 建立临时文件夹 在/tmp目录下, ex: /tmp/tmp5blnd3jh
    os.system(
        f'sshpass -p "westwell123" rsync -azvP junhong@192.168.105.19:/volume1{url} {tmp}') # 下载包含n个压缩包的文件夹
    folder_n = url.split('/')[-1]
    tmp_proj = os.path.join(tmp, folder_n)

    # A file is provided
    if os.path.isfile(tmp_proj):
        folder_n = folder_n.split('.')[0]
        src = tmp_proj
        dst = os.path.join(tmp, folder_n)
        print(f'Decompressing {src} to {dst}')
        task = Thread(target=unarchive, args=(src, dst))                       # 解压到临时目录
        task.start()
        task.join()
        # Update paths
        tmp_proj = os.path.join(tmp, folder_n)
        cp_fnames_base = [folder_n]

    # A path is provided
    else:
        cp_fnames = os.listdir(tmp_proj)
        cp_fnames_base = list(map(lambda fname: os.path.basename(fname).split('.')[0], cp_fnames))
        t_pool = []
        for full_n in cp_fnames:
            src = os.path.join(tmp_proj, full_n)
            dst = tmp_proj                                                         # 一会儿要根据包名提取lable所以分别解压到各自的文件夹， 而不是直接在tmp下
            print(f'\nDecompressing {src} to {dst}')
            task = Thread(target=unarchive, args=(src, dst))                       # 解压到临时目录
            t_pool.append(task)
            task.start()
        for t in t_pool:
            t.join()

    task = Thread(target=rename, args=(tmp,))                                  # 多线程方式进行重命名
    task.start()
    task.join()

    for base_n in cp_fnames_base:                                              # 对project内每个解压文件夹中的文件进行处理
        base_n_path = f'{tmp_proj}/{base_n}'
        # Guess file names
        ano_path = guess_ano_folder(base_n_path)
        img_path = guess_img_folder(base_n_path)
        
        for ano in os.listdir(ano_path):
            prj = read_Prj(base_n)                                             # 从文件夹名字取出label
            # Find duplication
            if has_dup(prj['project'], ano[:-4]):
                continue
            # Read other info
            img_format, size, objs = read_XML(os.path.join(ano_path, ano))
            ano_json = {'annotation': {'objects': objs}}
            formats = {'image': img_format}
            # Get tags
            if prj is not None and len(prj) > 4:
                tag_ids = [i.tag_id for i in Tags.objects.filter(tag_en__in=prj['tags'])] # 查询tag的id，返回列表类型
            else:
                tag_ids = []

            # 创建记录
            AnoTest.objects.create(hash=ano[:-4], size=size, format=formats, ano_type='pascal_voc', ano=ano_json, project_scene=prj['project_scene'], project_type=prj['project_type'], project=prj['project'], time_add=prj['time_add'], tags=tag_ids)
            # TODO: Save img to local volume

    e = send_mail(dict(to=email, sub='Data Upload Done',
                       content='''
                       Hi %s:

                            Your data in NAS: %s has been archived in Wellocean.
                            '''
                       % (email.split('@')[0], url)))
    if not e:
        print('Send email to:', email, 'success')

    shutil.rmtree(tmp)                                                         # 删除临时文件夹
