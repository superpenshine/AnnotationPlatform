// Filter.js
var coord_to_fix = null;        // 需要修复的dom ele

// Update table content
function update_table(data) {
    var tbody_proj = $("#proj-tbody"), 
    tbody_ano = $("#ano-tbody"); 

    // 清空原表
    tbody_proj.empty();
    tbody_ano.empty();

    // Update project table
    var tr_proj = document.createElement('tr'),
    td_scene = document.createElement('td'),
    td_type = document.createElement('td'),
    td_proj = document.createElement('td');
    td_scene.textContent = data.scene;  
    td_type.textContent = data.project;  
    td_proj.textContent = data.type; 
    tr_proj.appendChild(td_scene);
    tr_proj.appendChild(td_type);
    tr_proj.appendChild(td_proj);
    tbody_proj[0].appendChild(tr_proj);

    var small = document.querySelector('#small');
    // Update Annotation table
    for (var r in data.ano){
        ano_row = data.ano[r]
        var tr_ano = document.createElement('tr'),
        td_name = document.createElement('td'),
        input_name = document.createElement('input'), 
        td_coord = document.createElement('td'), 
        input_coord = document.createElement('input'), 
        td_preview = document.createElement('td'),  
        td_color = document.createElement('td'), 
        canvas_preview = document.createElement('canvas'); 

        // 修改dom ele属性
        input_name.classList.add('form-control-plaintext');
        input_name.value = ano_row['name'];
        input_coord.classList.add('form-control-plaintext');
        input_coord.classList.add('coord');
        input_coord.value = [ano_row.xmin, ano_row.ymin, ano_row.xmax, ano_row.ymax].join(', ');
        canvas_preview.width = 50;
        canvas_preview.height = 50;
        var w = ano_row.xmax - ano_row.xmin;
        var h = ano_row.ymax - ano_row.ymin;
        canvas_preview.getContext('2d').drawImage(small, ano_row.xmin, ano_row.ymin, w, h, 
                                                0, 0, 50, 50);
        td_color.id = "color"+r;

        // 元素排列
        td_name.appendChild(input_name);
        tr_ano.appendChild(td_name);
        td_coord.appendChild(input_coord);
        tr_ano.appendChild(td_coord);
        td_preview.appendChild(canvas_preview);
        tr_ano.appendChild(td_preview);
        tr_ano.appendChild(td_color);
        tbody_ano[0].appendChild(tr_ano);
    }
}

// Update labels/tags
function update_label_tags(msg){
    var tags_in = $('#tag-input'); 
    tags = msg.tags;
    tags_in[0].value = tags.join(" ");
}

// Update page
function update(msg){
    console.log(msg);
    // Update UI
    var small = document.querySelector('#small');
    small.onload = function(){
        // Update table
        update_table(msg);
        // Add coord fixer listener
        $('.coord').click(function(){
            coord_to_fix = $(this);
        })
        // Update tags/label
        update_label_tags(msg);
        DrawIM(msg);
    }
    small.src = msg.url;
    if (msg.width < 80 || msg.height < 80){
        small.setAttribute("style", "");
    } else {
        small.setAttribute("style", "display: none");
    }
}

//随机生成 rgb 颜色
function Color() {
    this.r = Math.floor(Math.random() * 255);
    this.g = Math.floor(Math.random() * 255);
    this.b = Math.floor(Math.random() * 255);
    this.color = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
};

// 计算修复的标注座标在原图的对应位置， 默认缩放为1280x720
// 标注名 point: 标注座标 width和height为原图长宽
// 会有一些精度损失，差距在1到2个px之间
function get_refine_coord(point, width, height){
    var xmax = point.xmax / (1280/width);
    var xmin = point.xmin / (1280/width);
    var ymax = point.ymax / (720/height);
    var ymin = point.ymin / (720/height);
    return [Math.floor(xmin), Math.floor(ymin), Math.floor(xmax), Math.floor(ymax)]
}

// 计算图像缩放尺寸，以及缩放后对应的标注座标，默认缩放为1280x720
// name: 标注名 point: 标注座标 width和height为原图长宽
// 会有一些精度损失，差距在1到2个px之间
function GetRec(name, point, width, height) {
    var xmax = point.xmax * (1280/width);
    var xmin = point.xmin * (1280/width);
    var ymax = point.ymax * (720/height);
    var ymin = point.ymin * (720/height);
    return {
        name: name,
        xmax: Math.floor(xmax),
        xmin: Math.floor(xmin),
        ymax: Math.floor(ymax),
        ymin: Math.floor(ymin)
    };
};

// 根据座标在canvas里画框，返回标注名和标注框颜色
function DrawRec(p, c=null) {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        if(c == null){
            c = new Color();
            ctx.strokeStyle = c.color;
        } else {
            ctx.strokeStyle = c;
        }
        // reduce line width if box too small
        ctx.lineWidth = 5;
        if (p.xmax - p.xmin < 20 || p.ymax - p.ymin < 20){
            ctx.lineWidth = 1;
        }
        ctx.strokeRect(p.xmin, p.ymin, p.xmax - p.xmin, p.ymax - p.ymin);
    };

    return {name:p.name,color:ctx.strokeStyle};
};

// Draw canvas and annotation boxes
function DrawIM(data, redraw=false){
    var canvas = document.querySelector('#canvas'), 
    ano = data.ano;
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var small = document.querySelector('#small');                             // 以默认隐藏的原图为src，在canvas上缩放
        ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
        for (var i in ano) { 
            var ano_row = ano[i];                                                 // 主循环                       
            var Rec = GetRec(ano_row.name, 
                            {xmax:ano_row.xmax, xmin:ano_row.xmin, ymin:ano_row.ymin, ymax:ano_row.ymax}, 
                            data.width, 
                            data.height
                            ); 
            var bg = document.getElementById("color"+i);// 根据 tr id 填充背景色
            if(redraw){
                DrawRec(Rec, bg.bgColor);
            } else{
                var obj = DrawRec(Rec); 
                bg.bgColor=obj.color;
            }
        }
    };
};


$(document).ready(function(){
    var canvas = $('canvas'), 
    ctx = canvas[0].getContext('2d'), 
    small = document.querySelector('#small'), 
    hash,  
    msgg,                                           // Local memory to keep msg
    zoom_x = canvas.attr('data-scale-x'),           // 自动xy缩放比例
    zoom_y = canvas.attr('data-scale-y'),
    canvas_w = canvas.width(),                      // canvas 长宽
    canvas_h = canvas.height(),  
    offset_left = canvas.offset().left,             // canvas 相对于屏幕座标
    offset_top = canvas.offset().top, 
    pre_x = (1-1/zoom_x)/canvas_w,                  // 减少重复计算
    pre_y = (1-1/zoom_y)/canvas_h, 
    zoom = false,                                   // 当鼠标移动到canvas上方时， 是否进行zoom
    zoomed = false,                                 // 画框后是否进行zoom座标换算
    hover= false,                                   // 鼠标移动到canvas上方
    mousedown = false,                              // 右键
    xmin, ymin, xmax, ymax,                         // 修复时选定的框框
    pageX, pageY,                                   // 实时鼠标座标
    tmp_ori_xmin, tmp_ori_ymin,                     // 图片放大并开始画框时， 临时放大坐标在原图位置
    fix = {};                                       // 本地存储修改

    ajax({ 
        type:"GET", 
        url:"get_next",
        dataType:"json", 
        success:function(msg){ 
            msgg = msg;
            hash = msg.hash;
            update(msg);
        }, 
        error:function(){ 
            console.log("Error"); 
        } 
    });

    // Correct/Wrong/Require Investigation
    $("#correct-button, #wrong-button, #check-button, #next-button").click(function(){
        var val = $(this).attr('value'); 
        var data = $("#fix-form").serialize() + "&hash=" + hash + "&state=" + val;
        var url = "/filter/confirm";
        // 有无本地修改
        if (Object.keys(fix).length != 0){
            data = data + "&fix=" + JSON.stringify(fix);
            //Clear out tmp fix data
            fix = {}; 
        }

        ajax({ 
            type:"POST", 
            url:url,
            data:data, 
            dataType:"json", 
            success:function(msg){ 
                msgg = msg;
                hash = msg.hash;
                update(msg);
            }, 
            error:function(){ 
                console.log("Error"); 
            } 
        });
    });

    // Fix: 搜集当前修改
    $("#fix-button").click(function(e){
        var ano = [];
        var tags = [];

        $("#ano-tbody tr").each(function(){
            var name = $(this).find('.form-control-plaintext')[0].value;
            var coords = $(this).find('.form-control-plaintext')[1].value.split(', ');
            var xmin = coords[0];
            var ymin = coords[1];
            var xmax = coords[2];
            var ymax = coords[3];
            ano.push({name: name, 
                    xmin: xmin, 
                    xmax: xmax, 
                    ymin: ymin, 
                    ymax: ymax});
        });
        $("$tag-input")
        fix.ano = ano;
        fix.tags = tags;
        console.log(fix);
    });

    // Detect mouse actions
    canvas.on('mouseover', function(){
        hover = true; 
    })
    .on('mouseout', function(){
        hover = false;
        DrawIM(msgg, redraw=true);
        xmin = null;
        xmax = null;
        ymin = null;
        ymax = null;
    })
    .on('mousemove', function(e){
        var tw = small.naturalWidth, 
        th = small.naturalHeight;
        var x = (e.pageX - offset_left);
        var y = (e.pageY - offset_top);
        if(zoom){
            // 放大后画框
            if(mousedown && xmin != null) {
                ctx.drawImage(small, x*tw*pre_x, y*th*pre_y, tw/zoom_x, th/zoom_y, 
                            0, 0, canvas_w, canvas_h); 
                var xmin_canvas = (tmp_ori_xmin-x*tw*pre_x)*zoom_x*canvas_w/tw;
                var ymin_canvas = (tmp_ori_ymin-y*th*pre_y)*zoom_y*canvas_h/th;
                DrawRec({xmax: x, xmin: xmin_canvas, 
                        ymax: y, ymin: ymin_canvas, 
                        name: 'temp_fix'}, 'rgb(0,0,0)');
            } 
            // 放大
            else {
                ctx.drawImage(small, x*tw*pre_x, y*th*pre_y, tw/zoom_x, th/zoom_y, 
                            0, 0, canvas_w, canvas_h); 
            }
        // 画框
        } else if(mousedown && xmin != null){
            ctx.drawImage(small, 0, 0, canvas_w, canvas_h); 
            DrawRec({xmax: x, xmin: xmin, 
                    ymax: y, ymin: ymin, 
                    name: 'temp_fix'}, 'rgb(0,0,0)')
        }
    })

    // Detecting ctrl key press for zoom in
    $(this).on('keydown', function(e){
        if(e.which == '17'){
            zoom = true;
            // 鼠标不动， 在canvas内按下ctrl仍需放大
            if(hover){
                var tw = small.naturalWidth, 
                th = small.naturalHeight;
                var x = (pageX - offset_left);
                var y = (pageY - offset_top);
                ctx.drawImage(small, x*tw*pre_x, y*th*pre_y, tw/zoom_x, th/zoom_y, 
                            0, 0, canvas_w, canvas_h); 
            }
            // 禁止画框途中进行zoom
            if(mousedown){
                xmin = null;
                xmax = null;
                ymin = null;
                ymax = null;
            }
        }
    })
    // Ctrl up
    .on('keyup', function(e){
        if(e.which == '17'){
            zoom = false;
            DrawIM(msgg, redraw=true);
        }
    })
    // Detecting if start drawing label bounding box
    .on('mousedown', function(e){
        if(e.which == '1'){
            mousedown = true;
            if(hover){
                // 判断新框画在zoom之前或之后
                if(zoom){
                    zoomed = true;
                }
                // 画框开始座标
                xmin = e.pageX - offset_left;
                ymin = e.pageY - offset_top;
                // 放大图片开始画框时记住最后放大的座标在原图的对应座标
                var tw = small.naturalWidth, 
                th = small.naturalHeight;
                tmp_ori_xmin = Math.round(xmin*tw*pre_x + (xmin*tw/canvas_w)/zoom_x);
                tmp_ori_ymin = Math.round(ymin*th*pre_y + (ymin*th/canvas_h)/zoom_y);
            }
        }
    })
    // Left up
    .on('mouseup', function(e){
        if(e.which == '1'){
            mousedown = false;
            if(hover){
                // 画框结束座标
                xmax = e.pageX - offset_left;
                ymax = e.pageY - offset_top;
                // 按照当前修复画框修正一次座标
                if (coord_to_fix && xmin != null){
                    var tw = small.naturalWidth, 
                    th = small.naturalHeight;
                    // Fix the coord
                    if (xmin > xmax) {
                        var tmp = xmax;
                        xmax = xmin;
                        xmin = tmp;
                    }
                    if (ymin > ymax) {
                        var tmp = ymax;
                        ymax = ymin;
                        ymin = tmp;
                    }
                    // Find corr coord in ori img
                    if (zoomed) {
                        // 分为当前zoom点在原图座标(与zoom有关)+框在canvas的座标对应的原图座标(作用与get_refine_coord相同)
                        refined = [tmp_ori_xmin, 
                                tmp_ori_ymin, 
                                Math.round(xmax*tw*pre_x+(xmax*tw/canvas_w)/zoom_x), 
                                Math.round(ymax*th*pre_y+(ymax*th/canvas_h)/zoom_y)]
                    } else {
                        // 未经zoom座标转换
                        refined = get_refine_coord({xmin: xmin, 
                                                    ymin: ymin, 
                                                    xmax: xmax, 
                                                    ymax: ymax}, 
                                                    tw, th);
                    }
                    // Show updated coord
                    coord_to_fix[0].value = refined.join(', ');
                    // Re-render canvas
                    var preview_canvas_ctx = coord_to_fix.parent().siblings().find('canvas')[0].getContext('2d');
                    preview_canvas_ctx.drawImage(small, refined[0], refined[1], refined[2]-refined[0], refined[3]-refined[1], 
                                                0, 0, 50, 50);
                }
            }
            zoomed = false; // 右键松开即为更新完毕或者不更新， 所以zoomed回到false
        }
    })

    // 记录当前鼠标位置（弥补ctrl keydown event无法获取当前座标）
    .on('mousemove', function(e){
        pageX = e.pageX;
        pageY = e.pageY;
    })
})
