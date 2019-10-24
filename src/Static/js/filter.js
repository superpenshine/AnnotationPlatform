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

    // Update annotation table
    for (var r in data.ano){
        var tr_ano = document.createElement('tr'),
        td_name = document.createElement('td'), 
        td_color = document.createElement('td'); 
        td_name.textContent = data.ano[r]['name'];

        tr_ano.appendChild(td_name);
        tr_ano.appendChild(td_color);
        tbody_ano[0].appendChild(tr_ano);
    }

}

// $(document).ready(function(){
//     $('.tile')
//     // tile mouse actions
//     .on('mouseover', function(){
//         $(this).children('.photo').css({'transform': 'scale('+ $(this).attr('data-scale') +')'});
//     })
//     .on('mouseout', function(){
        // $(this).children('.photo').css({'transform': 'scale(1)'});
//     })
//     .on('mousemove', function(e){
//         $(this).children('.photo').css({'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 +'%'});
//     })
//     // tiles set up
//     .each(function(){
//         $(this)
//         // add a photo container
//         .append('<div class="photo"></div>')
//         // some text just to show zoom level on current item in this example
//         .append('<div class="txt"><div class="x">'+ $(this).attr('data-scale') +'x</div>ZOOM ON<br>HOVER</div>')
//         // set up a background image for each tile based on data-image attribute
//         .children('.photo').css({'background-image': 'url('+ $(this).attr('data-image') +')'});
//     });
// })

// $(document).ready(function(){
//     $('#canvas')
//     // tile mouse actions
//     .on('mouseover', function(){
//     //     console.log("Mouse over");
//     //     var canvas = $(this);
//     //     var ctx = canvas[0].getContext('2d');
//     //     ctx.clearRect(0, 0, $(this).attr('width'), $(this).attr('height'));
//     //     // ctx.scale($(this).attr('data-scale-x'), $(this).attr('data-scale-x'));
//     //     ctx.drawImage(img, 0, 0, $(this).attr('width'), $(this).attr('height'))

//     })
//     .on('mouseout', function(){
//         console.log("Mouse out");
//     })
//     .on('mousemove', function(e){
//         console.log("Mouse move");
//         var ctx = $(this)[0].getContext('2d');
//         ctx.translate(e.pageX, e.pageY);
//     })
// })

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
function DrawRec(p) {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var c = new Color();
        ctx.lineWidth = 1;
        ctx.strokeStyle = c.color;
        ctx.strokeRect(p.xmin, p.ymin, p.xmax - p.xmin, p.ymax - p.ymin);
    };

    return {name:p.name,color:ctx.strokeStyle};
};

// Draw canvas and annotation boxes
function DrawIM(item){
    var canvas = document.querySelector('#canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var im = document.querySelector('#canvas_im');                             // 以默认隐藏的原图为src，在canvas上缩放
        var ori_w = im.naturalWidth;
        var ori_h = im.naturalHeight;
        canvas.width = 1280;
        canvas.height = 720;
        ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
        for (var i in item) { 
            var data = item[i];                                                    // 主循环                       
            var Rec = GetRec(data.name, 
                            {xmax:data.xmax, xmin:data.xmin, ymin:data.ymin, ymax:data.ymax}, 
                            ori_w, 
                            ori_h
                            );
            var obj = DrawRec(Rec);
            var bg = document.getElementById("{{forloop.counter}}_{{data.name}}"); // 根据 tr id 填充背景色
            // bg.bgColor=obj.color;
        }
    };
};

$(document).ready(function(){
    var url = "get_info?hash=" + $("#canvas_im").attr('value');
    ajax({ 
        type:"GET", 
        url:url,
        dataType:"json", 
        success:function(msg){ 
            var ano = msg.ano;
            // Update annotation table
            console.log(ano);
            DrawIM(ano);
            // Update table
            update_table(msg);
        }, 
        error:function(){ 
            console.log("Error"); 
        } 
    });

    $("#correct-button, #wrong-button, #check-button").click(function(){
        var btn = $(this).val, 
        val = btn.val();
        console.log($("#canvas_im").attr('value'));
        ajax({ 
            type:"GET", 
            url:'confirm',
            dataType:"json", 
            data: {"hash": $("#canvas_im").attr('value'), "state": val}, 
            success:function(msg){ 
                var ano = msg.ano;
                // Update annotation table
                console.log(ano);
                DrawIM(ano);
                // Update table
                update_table(msg);
            }, 
            error:function(){ 
                console.log("Error"); 
            } 
        });
    });

    var im = document.querySelector('#canvas_im');
    var ori_w = im.naturalWidth;
    var ori_h = im.naturalHeight;
    console.log(ori_h, ori_w);
    if (ori_h < 80 || ori_w < 80){
        var small = $("#small");
        small[0].src = im.src;
    }

})
