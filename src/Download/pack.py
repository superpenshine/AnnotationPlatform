import os
import shutil
import xml.etree.ElementTree as et

from xml.dom import minidom
from welldb.settings import CONFIG

# 从 数据库中 的 data（queryset类型） 转换为 xml string
def gen_XML(data):
    ano = et.Element('annotation')
    name = et.SubElement(ano, 'img_name')
    name.text = data.hash + '.' + data.format['image']
    path = et.SubElement(ano, 'img_path')
    path.text = '/workspace/data/JPEGImages/'
    size = et.SubElement(ano, 'img_size')
    width = et.SubElement(size, 'width')
    width.text = str(data.size['width'])
    height = et.SubElement(size, 'height')
    height.text = str(data.size['height'])
    depth = et.SubElement(size, 'depth')
    depth.text = "3"

    for v in data.ano['annotation']['object']:                                 # data.ano 数据库中为 jsonb格式，django读取时转换为dict。
                                                                               #exp： {‘annotation’:{'object':[{'name':name,'bndbox':{'xmax':1,'xmin':1,'ymax':1,'ymin':1}}]}}
        obj = et.SubElement(ano, 'object')     
        name = et.SubElement(obj, 'name')
        if 'name' in v:
            name.text = v['name']
        bdbox = et.SubElement(obj, 'bndbox')
        for j, x in v['bndbox'].items():
            if j == 'xmax':
                xmax = et.SubElement(bdbox, 'xmax')
                xmax.text = str(x)                                             # 座标为int类型，需要显式转换为string
            elif j == 'xmin':
                xmin = et.SubElement(bdbox, 'xmin')
                xmin.text = str(x)
            elif j == 'ymax':
                ymax = et.SubElement(bdbox, 'ymax')
                ymax.text = str(x)
            elif j == 'ymin':
                ymin = et.SubElement(bdbox, 'ymin')
                ymin.text = str(x)

    return ano

# 转移图片和生成xml到新的文件夹
# im： queryset 类型, dst: 打包到的主文件夹, a: 主文件夹下的 xml 存储位置， i: 主文件夹下 图片 的存储位置
def pack(im, dst, a, i):
    # src = '/workspace/data/JPEGImages/'                                              # 图片的源路径
    src = CONFIG.img_path
    imc = os.path.join(src, im.hash+'.'+im.format["image"])                            
    if os.path.exists(imc):                                                            # Check if img exists
        shutil.copy(imc, os.path.join(i, im.hash+'_' +
                                      str(im.time_add)+'.'+im.format["image"]))        # 存储图片名为 hash_2019-08-01.jpg
        ano = gen_XML(im)
        xmlstr = minidom.parseString(
            et.tostring(ano)).toprettyxml(indent="   ")
        with open(os.path.join(a, im.hash+'_'+str(im.time_add)+'.xml'), "w+") as f:    # 图片和xml同名
            f.write(xmlstr)
            f.close()
    print('Done with pack image: ', os.path.join(i, im.hash+'_' +
                                                 str(im.time_add)+'.'+im.format["image"]))
    return dst
