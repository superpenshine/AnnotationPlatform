### *wellocean*
- config
    - 用户名：westwell
    - 密码: westwell-lab

##### *annotation*
- hash
    - max=64,varchar 图片文件hash值
- size
    - jsonb, {'width':1280,'height':720,'depth':3} 图片大小
- format
    - jsonb,{'image':'jpg'} 之后有视频可以定义为 {'video':'mp4'}

- project_scene 
- project_type
- project
- ano_type
    - max=16,varchar 标注类型, 现有cls和pascal_voc
- ano
    - jsonb,默认为 {'annotation':{'object':[{'name':name,'bndbox':{'xmax':xmax...}}...]}}
- tags
    - text[] 存储为 tag id 的列表
    - tag_id 对应表 Tags 的 tag_id
- time_add
    - data，默认为存入当天的日期，精确到年月日
- id
    - 默认为序列 annotation_id_seq
- check_state
    - 数据检查状态，0表示待检查，1表示正确，2表示有错误，3表示待进一步确认

##### *tags*
- tag_class
    - max=32 varchar,tag 类型
- tag_en
    - max=32 varchar,tag 英文描述，对应标注文档,允许default
- tag_id
    - tag对应的id，存入annotation表的tags中
- id
    - 默认为序列 tags_id_seq

##### *queue*
- mail
    - max=32 varchar,信息提取人邮箱，可重复
- task_list
    - integer[], 存储需要打包的数据id，为int列表类型
- id
    - 默认为序列 queue_id_seq
