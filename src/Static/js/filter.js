// Filter.js

// Update table content
function update_table(data) {
    var tbody_proj = $("#proj-tbody"), 
    tbody_ano = $("#ano-tbody"); 
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

        input_name.classList.add('form-control-plaintext');
        input_name.value = ano_row['name'];
        input_coord.classList.add('form-control-plaintext');
        input_coord.classList.add('coord');
        input_coord.value = [ano_row.xmin, ano_row.ymin, ano_row.xmax, ano_row.ymax].join(', ');
        canvas_preview.width = 50;
        canvas_preview.height = 50;
        var w = ano_row.xmax - ano_row.xmin;
        var h = ano_row.ymax - ano_row.ymin;
        canvas_preview.getContext('2d').drawImage(small, ano_row.xmin, ano_row.ymin, w, h, 0, 0, 50, 50);
        td_color.id = "color"+r;

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

$(document).ready(function(){

})

//随机生成 rgb 颜色
function Color() {
    this.r = Math.floor(Math.random() * 255);
    this.g = Math.floor(Math.random() * 255);
    this.b = Math.floor(Math.random() * 255);
    this.color = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
};

// 计算图像缩放尺寸，以及缩放后对应的标注座标，默认缩放为1280x720
// name: 标注名 points: 标注座标 width和height为原图长宽
// 会有一些精度损失，差距在1到2个px之间
function GetRec(name, points, width, height) {
    var xmax = points.xmax * Math.round(1280/width *100)/100;
    var xmin = points.xmin * Math.round(1280/width *100)/100;
    var ymax = points.ymax * Math.round(720/height *100)/100;
    var ymin = points.ymin * Math.round(720/height *100)/100;
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
        ctx.lineWidth = 5;
        if (p.xmax - p.xmin < 20 || p.ymax - p.ymin < 20){
            ctx.lineWidth = 1;
        }
        ctx.strokeRect(p.xmin, p.ymin, p.xmax - p.xmin, p.ymax - p.ymin);
    };

    return {name:p.name,color:ctx.strokeStyle};
};

var msgg;
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
    var url = "get_next";
    var hash;
    var zoom = false;
    var canvas = $('canvas'),
    ctx = canvas[0].getContext('2d'), 
    zoom_x = canvas.attr('data-scale-x'), 
    zoom_y = canvas.attr('data-scale-y'),
    canvas_w = canvas.width(),
    canvas_h = canvas.height(),  
    offset_left = canvas.offset().left, 
    offset_top = canvas.offset().top, 
    pre_x = (1-1/zoom_x)/canvas_w, 
    pre_y = (1-1/zoom_y)/canvas_h;
    var rec_start = false;
    var rec_end = false;
    var hover= false;

    ajax({ 
        type:"GET", 
        url:url,
        dataType:"json", 
        success:function(msg){ 
            msgg = msg;
            hash = msg.hash;
            update(msg);
            // Add coord fixer listener
            $('.coord').click(function(){
                console.log('clicked on coord');
                var coord = $(this);
            })
        }, 
        error:function(){ 
            console.log("Error"); 
        } 
    });

    $("#correct-button, #wrong-button, #check-button").click(function(){
        var btn = $(this), 
        val = btn.attr('value'), 
        url = "confirm?hash=" + hash + "&state=" + val;
        ajax({ 
            type:"GET", 
            url:url,
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

    $("#fix-form").submit(function(e){
        var fix_form = $(this);
        e.preventDefault();
        var type = fix_form.attr('method');
        var url = fix_form.attr('action');
        var data = fix_form.serialize();
        data = data + "&hash=" + hash;
        ajax({ 
            type:type, 
            url:url, 
            dataType:"text", 
            data:data, 
            success:function(msg){ 
                alert(msg);
            }, 
            error:function(msg){ 
                alert(msg);
            } 
        });
    });

    // detect mouse actions
    canvas.on('mouseover', function(){
        // console.log("Mouse over");
        hover = true; 
        console.log('hover', hover);
    })
    .on('mouseout', function(){
        hover = false;
        DrawIM(msgg, redraw=true);
        console.log('hover', hover);
    })
    .on('mousemove', function(e){
        // console.log("Mouse move", e.pageX, e.pageY);
        if(zoom){
            var small = document.querySelector('#small');
            var tw = $("#small")[0].naturalWidth, 
            th = $("#small")[0].naturalHeight;
            ctx.clearRect(0, 0, canvas_w, canvas_h);

            var x = (e.pageX - offset_left);
            var y = (e.pageY - offset_top);
            ctx.drawImage(small, x*tw*pre_x, y*th*pre_y, tw/zoom_x, th/zoom_y, 0, 0, canvas_w, canvas_h); 
        }
    })

    // Detecting ctrl key press for zoom in
    $(this).on('keydown', function(e){
        if(event.which == '17'){
            zoom = true;
        }
    })
    .on('keyup', function(e){
        if(event.which == '17'){
            zoom = false;
            DrawIM(msgg, redraw=true);
        }
    })

    // Detecting if start drawing label bounding box
    $(this).on('mousedown', function(e){
        if(e.which == '1'){
            if(hover){
                console.log('start drawing', e.pageX - offset_left, e.pageY - offset_top);
            }
        }
    })

    $(this).on('mouseup', function(e){
        if(e.which == '1'){
            if(hover){
                console.log('stop drawing', e.pageX - offset_left, e.pageY - offset_top);
            }
        }
    })

})
