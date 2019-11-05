// JS file for search.html


// 自动更新选项收到服务器response后， 根据此memory选择默认展示项（用户之前选择）。
// 'input-tags'是tagsinput和input-tags之间的数据关联
var mem = {"input-scene":'*', "input-type":'*',"input-project":'*',"input-tags":[], "daterangepicker":''};
//Local memory for unchecked checkboxes
var unchecked = [];

// Update options availabel in dropdown lists
function update_opt(msg){
    var scene = $("#input-scene")[0];
    var type = $("#input-type")[0];
    var project = $("#input-project")[0];
    var tag = $("#input-tags")[0];
    $('.gen').remove();

    // Update Options
    for (var s in msg['scenes']){
        var text = msg['scenes'][s];
        var opt = document.createElement('option');
        opt.classList.add('gen');
        opt.textContent = text;
        scene.appendChild(opt);
        if (text == mem['input-scene']) {
            opt.selected = true;
        }
    }
    for (var t in msg['types']){
        var text = msg['types'][t];
        var opt = document.createElement('option');
        opt.classList.add('gen');
        opt.textContent = text;
        type.appendChild(opt);
        if (text == mem['input-type']) {
            opt.selected = true;
        }
    }
    for (var p in msg['projects']){
        var text = msg['projects'][p];
        var opt = document.createElement('option');
        opt.classList.add('gen');
        opt.textContent = text;
        project.appendChild(opt);
        if (text == mem['input-project']) {
            opt.selected = true;
        }
    }
    for (var t in msg['tags']){
        var text = msg['tags'][t];
        var opt = document.createElement('option');
        opt.classList.add('gen', 'gen-tag');
        opt.textContent = text;
        tag.appendChild(opt);
        if (text == mem['input-tags'][mem['input-tags'].length - 1]) {
            opt.selected = true;
        }
    }
    // $(document).on('click', '.gen-tag', function(){
    //     console.log($(this));
    //     $("#tagsinput").tagsinput('add', $(this).val());
    // })
    
}

// Update daterangepicker properties
function update_drp(msg){
    var drp = $("#daterangepicker").data('daterangepicker');
    drp.setStartDate(msg.from);
    drp.setEndDate(msg.to);
}

// Update UI on tabel refresh
function update_ui(page, total){
    // Next page button
    if (10*(page+1) > total){
        $("#next-btn-li")[0].classList.add("disabled");
    } else {
        $("#next-btn-li")[0].classList.remove("disabled");
        $("#next-btn-a")[0].setAttribute("action", "show_page?page=" + (page+1).toString());
    }

    // Previous page button
    if (page == 1){
        $("#prev-btn-li")[0].classList.add("disabled");
    } else {
        $("#prev-btn-li")[0].classList.remove("disabled");
        $("#prev-btn-a")[0].setAttribute("action", "show_page?page=" + (page-1).toString());
    }

    // Current page input
    cur_page = $("#curr-page")[0];
    cur_page.placeholder = page.toString();
    cur_page.value = null;

    if (total <= 10){
        cur_page.disabled=true;
    } else {
        cur_page.disabled=null;
    }
}

// Update table entries
function update_table(data){
    var tbody = $("tbody");
    tbody.empty();
    // Select specific children, for reference only
    // $('tbody').children('tr').each(function(){
    //     $(this).children('th, td:lt(4)').remove();
    // })
    var sel_all_input = $("#sel-all-input")[0];
    sel_all_input.checked = true;
    var i = 1
    for (var r in data) {
        data_row = data[r]
        //Update table content
        tr = document.createElement('tr'), 
        th = document.createElement('th'), 
        td_scene = document.createElement('td'), 
        td_type = document.createElement('td'), 
        td_project = document.createElement('td'), 
        td_time_added = document.createElement('td'), 
        td_preview = document.createElement('td'), 
        img_preview = document.createElement('img'), 
        td_checkbox = document.createElement('td'), 
        div_checkbox = document.createElement('div'), 
        input_checkbox = document.createElement('input'), 
        label_checkbox = document.createElement('label');
        th.setAttribute("scope", "row");
        th.textContent = data_row['id'];
        td_scene.textContent = data_row['project_scene'];
        td_type.textContent = data_row['project_type'];
        td_project.textContent = data_row['project'];
        td_time_added.textContent = data_row['time_add'];
        tr.appendChild(th);
        tr.appendChild(td_scene);
        tr.appendChild(td_type);
        tr.appendChild(td_project);
        tr.appendChild(td_time_added);

        // Update preview
        hash = data_row['hash']
        img_preview.classList.add("preview");
        img_preview.src = '/media/' + hash + "." + data_row['format']['image'];
        img_preview.alt = hash + '.' + data_row['format']['image'];
        td_preview.appendChild(img_preview);
        tr.appendChild(td_preview);

        // Update checkbox bindings
        var id_str = data_row['id'].toString();
        div_checkbox.classList.add("custom-control");
        div_checkbox.classList.add("custom-checkbox");
        input_checkbox.classList.add("custom-control-input");
        input_checkbox.classList.add("ckb");
        input_checkbox.classList.add('.active');
        input_checkbox.id = "customCheck" + i;
        input_checkbox.type = "checkbox";
        input_checkbox.value = id_str;
        label_checkbox.classList.add("custom-control-label");
        label_checkbox.setAttribute ("for", "customCheck" + i);

        // 更新全部下载选择按钮ui
        if ($.inArray(id_str, unchecked) == -1) {
            input_checkbox.checked = true;
        } else {
            sel_all_input.checked = null;
        }

        div_checkbox.appendChild(input_checkbox);
        div_checkbox.appendChild(label_checkbox);
        td_checkbox.appendChild(div_checkbox);
        tr.appendChild(td_checkbox);
        tbody[0].appendChild(tr);

        i += 1;
    }
}


// Update dropdown options for current filter condition 
// 考虑到用户可能在tagsinput中手动输入， 这里只将选中值加入tagsinput， 
// 触发itemAdded进行下一步操作
$(function() {
    $(".form-control").change(function(e){
        // Update tagsinput
        if($(this)[0].id == 'input-tags') {
            if ($(this).val() != '*'){
                $("#tagsinput").tagsinput('add', $(this).val());
                return
            }
            mem['input-tags'] = [];
            $("#tagsinput").tagsinput('removeAll');
        } else {
            mem[$(this)[0].id] = $(this)[0].value; 
        }

        // Gather current choice and update options
        var data = $("#main_search_form input, #main_search_form select[id!='input-tags']").serialize() + "&tags=" + JSON.stringify(mem['input-tags']);
        var url = "/search/update_opts"; 
        ajax({ 
            type:"POST", 
            url:url,
            data: data, 
            dataType:"json", 
            success:function(msg){ 
                update_opt(msg); 
                update_drp(msg); 
            }, 
            error:function(){ 
                console.log("Error"); 
            } 
        });
        console.log(mem);
    });
})

// Trigger for search condition submit button
$(function(){
    $("#main_search_form").submit(function(e) {
        e.preventDefault();
        var type = $(this).attr('method');
        var url = $(this).attr('action');
        var data = $("#main_search_form input, #main_search_form select[id!='input-tags']").serialize() + "&tags=" + JSON.stringify(mem['input-tags']);
        unchecked = [];
        ajax({ 
            type:type, 
            url:url, 
            dataType:"json", 
            data:data, 
            success:function(msg){ 
                console.log(msg);
                var total = msg.total, page = parseInt(msg.page), data = msg.data;
                if (total == 0){}
                // Update table entries
                update_table(data);
                // Update page navbar ui
                update_ui(page, total);
                // Update total number of data entries
                $("#total")[0].textContent = "Total number of records: "+total.toString();
            }, 
            error:function(){ 
                console.log("Error"); 
            } 
        });

    });  
})

// Trigger for page navigation buttons
$(function(){
    $(".page-nav-btn").click(function(e) {
        var url = $(this).attr('action');
        ajax({ 
            type:"GET", 
            url:url,
            dataType:"json", 
            success:function(msg){ 
                var total = msg.total, page = parseInt(msg.page), data = msg.data;
                if (total == 0){}
                // Update table entries
                update_table(data);
                // Update page navbar ui
                update_ui(page, total);
            }, 
            error:function(){ 
                console.log("Error"); 
            } 
        });
    });
})

// Trigger for page jump input field
$(function(){
    $("#curr-page").keypress(function(e) {
        if (e.which == 13) {
            req_page = $(this)[0].value;
            if (req_page == '') {
                req_page = $(this)[0].placeholder.toString();
            } else if (req_page <= 0) {
                req_page = 1;
            }
            var url = "show_page?page=" + req_page;
            ajax({ 
                type:"GET", 
                url:url,
                dataType:"json", 
                success:function(msg){ 
                    var total = msg.total, page = parseInt(msg.page), data = msg.data;
                    if (total == 0){}
                    // Update table entries
                    update_table(data);
                    // Update page navbar ui
                    update_ui(page, total);
                }, 
                error:function(){ 
                    console.log("Error"); 
                } 
            });
        }
    });
})

// Add to memory when tag added, then update options
.on('itemAdded itemRemoved', '#tagsinput', function(e) {
    // Update local memory
    mem['input-tags'] = $(this).val(); 
    // Gather current choice
    var data = $("#main_search_form input, #main_search_form select[id!='input-tags']").serialize() + "&tags=" + JSON.stringify(mem['input-tags']);
    var url = "/search/update_opts"; 
    // Update local memory
    ajax({ 
        type:"POST", 
        url:url,
        data: data, 
        dataType:"json", 
        success:function(msg){ 
            update_opt(msg); 
            update_drp(msg); 
        }, 
        error:function(){ 
            console.log("Error"); 
        } 
    });
})

.on('click','.ckb',function(e){
    var val = $(this).val();
    if($(this).is(':checked')){
        // Remove from unchecked
        unchecked = unchecked.filter(function(value, index, arr) {
            return value != val;
        });
    } else {
        // Add to checked
        unchecked.push(val);
        $('#sel-all-input')[0].checked = null;
    }
    console.log(unchecked);
})

// Update dropdown options for current date range
.on('click', '.applyBtn, .cancelBtn', function(){
    // Gather current conditions
    var data = $("#main_search_form input, #main_search_form select[id!='input-tags']").serialize() + "&tags=" + JSON.stringify(mem['input-tags']);
    // Update local memory
    mem['daterangepicker'] = $("#daterangepicker")[0].value;
    var url = "/search/update_opts";
    ajax({ 
        type:"POST", 
        url:url,
        data: data, 
        dataType:"json", 
        success:function(msg){ 
            console.log(msg);
            update_opt(msg);
        }, 
        error:function(){ 
            console.log("Error"); 
        } 
    });
})

// $(document).on('click','.ckb:not(:checked)',function(e){
//     unchecked.push($(this).val());
//     console.log(unchecked);
// });

//For select all button
.on('click','#sel-all-input',function(e){
    if($(this).is(':checked')){
        // Remove all ids in current page from unchecked
        $(".ckb").each(function(){
            var val = $(this).val();
            $(this)[0].checked = true;
            unchecked = unchecked.filter(function(value, index, arr) {
                return value != val;
            });
        });
    } else {
        // Add to unchecked
        $(".ckb").each(function(){
            $(this)[0].checked = null;
            unchecked.push($(this).val());
        });
    }
    console.log(unchecked);
})

.on('click', ".preview", function(){
    $(".modal")[0].style.display = "block";
    $(".modal-content")[0].src = this.src;
    $(".modal-caption")[0].innerHTML = this.alt;
})

// For download function
$(function(){
    $("#dl-form").submit(function(e){
        e.preventDefault();
        var form = $(this);
        var type = form.attr('method');
        var url = form.attr('action');
        data = form.serialize() + "&unchecked=" + JSON.stringify(unchecked);
        console.log(data);
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
})

// When the user clicks on <span> (x), close the modal
$(function(){
    $(".close").click(function(){
        $(".modal")[0].style.display = "none";
    });
})
