
import os
import random
import shutil
import smtplib
import urllib
import uuid
from .pack import pack                                                         # 根据queryset结果打包单张图片和xmlz
from tempfile import mkdtemp
from email.message import EmailMessage
from Search.models import Annotation, Queue
from welldb.settings import MEDIA_ROOT, CONFIG
from email.headerregistry import Address

def send_mail(mail):
    host = CONFIG.email_host
    user = CONFIG.smtp_usr
    pwd = CONFIG.smtp_pwd
    msg = EmailMessage()
    msg.set_content(mail['content'])
    msg['Subject'] = mail['sub']
    msg['From'] = Address(CONFIG.smtp_sender_name, CONFIG.smtp_from_usr, CONFIG.smtp_sender_host)
    msg['to'] = Address(mail['to'].split('@')[0].replace(
        '.', ''), mail['to'].split('@')[0], CONFIG.smtp_receiver_host)

    try:
        with smtplib.SMTP(host) as smp:
            smp.login(user, pwd)
            smp.send_message(msg)

    except Exception as e:
        print(e)
        return e

# 把tar.gz 压缩包上传NAS
def nas_upload(f):
    os.system(
        f'sshpass -p {CONFIG.nas_pwd} rsync -azvP {f} {CONFIG.nas_usr}@{CONFIG.nas_addr}:{CONFIG.nas_stor}')
    return

# 提取图片的存储目录
def check_dirs():
    dst = os.path.join(MEDIA_ROOT, 'data_collected/'+str(uuid.uuid4()).split('-')[0])
    ano = os.path.join(dst, "Annotations")
    img = os.path.join(dst, "JPEGImages")
    for ck in [ano, img]:
        if not os.path.exists(ck):
            os.makedirs(ck)
    return dst, ano, img

# 主要打包的函数 
# to: 邮件接受者  cache_id: queue 数据库中存储的 id，一般为填写的邮件名 condi: 查询时提供的搜索条件，会一起写在邮件里，方便归档
def run(to, cache_id, condi):
    pack_dir = os.path.join(MEDIA_ROOT, 'data/data_cache/')
    id_list = Queue.objects.filter(mail=to).last().task_list                   # 遇到同名取最近插入的一条数据   task_list: 搜索结果页面缓存的 id list 会传递到 queue 数据库里的 task_list
    if not id_list:
        return
    else:
        data = Annotation.objects.filter(id__in=id_list)
        dst, ano, img = check_dirs()
        for im in data:
            dst = pack(im, dst, ano, img)
        filename = to.split('@')[0].replace(
            '.', '').upper()+'_'+str(uuid.uuid4()).split('-')[0]               # 通过UUID生成唯一文件名 exp: SHUFANWANG_1234dsaiu
        
        shutil.make_archive(pack_dir+filename, 'gztar', dst) 

        f = os.path.join(pack_dir, filename+'.tar.gz')                         # 最终打包好的tar.gz压缩包
        print(f)
        if os.path.exists(f):

            nas_upload(f) 
            
            e = send_mail(dict(to=to, sub='Data Packed Done',
                               content='''
                               Hi %s:

                                    Your data is done into NAS:/public/data_collected/%s.tar.gz
                                    With Searching conditions: %s
                                    '''
                               % (to.split('@')[0], filename, urllib.parse.unquote(condi))))
            if not e:
                print('Send email to:', to, 'success')
        
        shutil.rmtree(dst)                                                     # 删除提取图片和XML的目录，节省空间，但是保留压缩包
