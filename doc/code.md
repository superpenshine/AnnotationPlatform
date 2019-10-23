### AlphaApi 

##### *Search module*
- url routers
    1. 显示dropdown: views.index
    2. 自动根据已输入搜索条件更新未填写dropdown可用选项
    3. 根据搜索框中的条件进入 views.Query.search
    4. 传递查询结果到 views.Query.show_res
    5. 确认无误后填写邮箱，进入带跳转功能的 views.Query.red_download
    6. 进入Download module 打包并返回 info.html,显示信息

- views
    1. Query为主类，提供函数间的共享缓存
    2. red_download 把提取的数据存入队列并跳转到打包路径

- models
    1. 整个AlphaApi的models 都在此定义一次，其他modules 只需要import Search.models 即可

##### *Download module*
- pack.py 为 打包函数部分
- tasks.py 为分离出来的发邮件，以及上传NAS功能


##### *Filter module*
- url routers 
1. /confirm 处理审核信息标志，共0-3四个等级
2. /fix 处理修正信息

- views
1. Index 为主入口
2. checked 为审核信息标志位存入数据库
3. fix 为修改的label和tags信息存入数据库

- frontend
1. 利用canvas 缩放原始图像至1280x720,并相对缩放标注座标位置
2. 修正的label和tags以逗号分隔，文档在 http://192.168.105.19:30000/wwl-research/team-alpha/wellannotation_doc

##### *Upload module*
- url routers
1. 输入框从NAS提取压缩包,默认为zip或者tar.gz格式，命名以 *scene_type_prj_time_tags1_tags2* 为规范，每一个label之内只能包含 - ，不可包含 _ 。 示例1： **/WellOcean_Data/Picture/label/Ahj_fix_label/plate-num/gate_plate-num_daxie_2018-01-01_night_double.tar.gz**
示例2： **/WellOcean_Data/Picture/label/Ahj_fix_label/plate-num/gate_plate-num_daxie_2018-01-01.zip**
   输入框也可输入NAS路径名， 默认以 / 开头。 路径下所有压缩包将被下载归档。
示例1： **/WellOcean_Data/Picture/label/Ahj_fix_label/plate-num**
2. 在临时文件夹解压，并存入数据库，现阶段使用测试数据表(AnoTest)， 数据查重完成。
3. 已添加发送邮件功能
4. 未加入图片转储功能
