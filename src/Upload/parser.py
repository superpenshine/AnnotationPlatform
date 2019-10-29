# Parsers
import os
from datetime import datetime
import xml.etree.ElementTree as et

'''
XML parser class to read annotations from xml file
在此处加入不同格式xml的读取方法
template: 在此处加入不同格式xml读取的方法, read_XML方法
将依次使用
template_proj: 如果read_XML提供了project name， 则尝试
寻找project对应template。
'''
class XMLParser:
    def __init__(self):
        self.template = [self.detection_task1, 
                         self.detection_task2]
        # self.template_proj = {"container": self.detection_task1, 
        #                       "project1": self.detection_task1,  # Dummy row for test, can be removed
        #                       "plate": self.detection_task1}

    def read_XML(self, file, proj=None):

        for f in self.template:
            try:
                return f(file)
            except:
                continue

            # No valid parse func found
            raise NotImplementedError(f"No valid function that can parse {file}.")

    '''
    解析 xml 文件的方法，取出 size, objects 和 image format
    示例1:使用左上座标和右下座标    
    '''
    def detection_task1(self, file):
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

    '''
    示例２:使用左上座标和width, height  
    '''
    def detection_task2(self, file):
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
            xmax = bndbox.find('width').text
            ymax = bndbox.find('height').text
            objs.append({'name': name, 'xmin': xmin,
                         'ymin': ymin, 'xmax': xmax, 'ymax': ymax})

        return img_format, size, objs

# Parse datetime
def parse_date(time):
    for date_format in ['%Y%m%d', '%Y-%m-%d']:
        try:
            return datetime.strptime(time, date_format).strftime('%Y-%m-%d')
        except ValueError:
            pass

    raise ValueError("No valid time format.")


# Guessannotation folder
def guess_ano_folder(base_path):
    for f_n in ['Annotation', 'Annotations', 'annotation', 'annotations']:
        ano_path = os.path.join(base_path, f_n)
        if os.path.exists(ano_path):
            return ano_path

    raise ValueError("No valid annotation folder format.")


# Guessimage folder
def guess_img_folder(base_path):
    for f_n in ['JPEGImage', 'JPEGImages', 'image', 'images']:
        img_path = os.path.join(base_path, f_n)
        if os.path.exists(img_path):
            return img_path

    raise ValueError("No valid image folder format.")