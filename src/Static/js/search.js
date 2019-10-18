//JS file for search.html

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
    cur_page.setAttribute("placeholder", page.toString());
    cur_page.value = null;
    if (total <= 10){
        cur_page.setAttribute("disabled", "");
    } else {
        cur_page.removeAttribute("disabled", "");
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
    var i = 1
    for (var r in data) {
        //change table data
        var tr = document.createElement('tr')
        var th = document.createElement('th');
        var td_scene = document.createElement('td');
        var td_type = document.createElement('td');
        var td_project = document.createElement('td');
        var td_time_added = document.createElement('td');
        var td_checkbox = document.createElement('td');
        var div_checkbox = document.createElement('div');
        var input_checkbox = document.createElement('input');
        var label_checkbox = document.createElement('label');

        div_checkbox.classList.add("custom-control");
        div_checkbox.classList.add("custom-checkbox");
        input_checkbox.classList.add("custom-control-input");
        input_checkbox.classList.add("ckb");
        input_checkbox.classList.add('.active');
        input_checkbox.id = "customCheck" + i;
        input_checkbox.type = "checkbox";
        label_checkbox.classList.add("custom-control-label");
        label_checkbox.setAttribute ("for", "customCheck" + i);
        input_checkbox.setAttribute("checked", "checked");

        th.setAttribute("scope", "row");
        th.textContent = data[r]['id'];
        td_scene.textContent = data[r]['project_scene'];
        td_type.textContent = data[r]['project_type'];
        td_project.textContent = data[r]['project'];
        td_time_added.textContent = data[r]['time_add'];

        tbody[0].appendChild(tr);
        div_checkbox.appendChild(input_checkbox);
        div_checkbox.appendChild(label_checkbox);
        td_checkbox.appendChild(div_checkbox);

        tr.appendChild(th);
        tr.appendChild(td_scene);
        tr.appendChild(td_type);
        tr.appendChild(td_project);
        tr.appendChild(td_time_added);
        tr.appendChild(td_checkbox);
        i += 1;
    }
}

// Trigger for search condition submit button
$(function(){
    $("#main_search_form").submit(function(e) {
        e.preventDefault();
        var form = $(this);
        var url = form.attr('action');
        var type = form.attr('method');
        ajax({ 
            type:type, 
            url:url, 
            dataType:"json", 
            data:form.serialize(), 
            success:function(msg){ 
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
                console.log("error"); 
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
                console.log("error"); 
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
                    console.log("error"); 
                } 
            });
        }
    });
})

// For download function
$(function(){
    $("#dl-form").submit(function(e){
        e.preventDefault();
        var form = $(this);
        var type = form.attr('method');
        var url = form.attr('action');
        ajax({ 
            type: type, 
            url:url, 
            dataType:"text", 
            data:form.serialize(), 
            success:function(msg){ 
            }, 
            error:function(msg){ 
                alert(msg);
            } 
        });
    });
})

// Local memory
var mem = {"input-scene":'*', "input-type":'*',"input-project":'*',"input-tags":'*', "daterangepicker":''};
// For update dropdown options for current filter conditions
$(function() {
    $(".form-control").change(function(e){
        // alert('aa');
        // Gather current conditions
        var data = $('#main_search_form').serialize();
        //update local memory
        mem[$(this)[0].id] = $(this)[0].value;

        console.log(mem);
        $('.gen').remove();
        var url = "/search/update_opts";

        ajax({ 
            type:"POST", 
            url:url,
            data: data, 
            dataType:"json", 
            success:function(msg){ 
                console.log(msg);
                var scene = $("#input-scene")[0];
                var type = $("#input-type")[0];
                var project = $("#input-project")[0];
                var tag = $("#input-tags")[0];

                // Update Options
                for (var s in msg['scenes']){
                    var text = msg['scenes'][s];
                    var opt = document.createElement('option');
                    opt.classList.add('gen');
                    opt.textContent = text;
                    scene.appendChild(opt);
                    if (text == mem['input-scene']) {
                        opt.setAttribute("selected", '');
                    }
                }
                for (var t in msg['types']){
                    var text = msg['types'][t];
                    var opt = document.createElement('option');
                    opt.classList.add('gen');
                    opt.textContent = text;
                    type.appendChild(opt);
                    if (text == mem['input-type']) {
                        opt.setAttribute("selected", '');
                    }
                }
                for (var p in msg['projects']){
                    var text = msg['projects'][p];
                    var opt = document.createElement('option');
                    opt.classList.add('gen');
                    opt.textContent = text;
                    project.appendChild(opt);
                    if (text == mem['input-project']) {
                        opt.setAttribute("selected", '');
                    }
                }
                for (var t in msg['tags']){
                    var text = msg['tags'][t];
                    var opt = document.createElement('option');
                    opt.classList.add('gen');
                    opt.textContent = text;
                    tag.appendChild(opt);
                    if (text == mem['input-tags']) {
                        opt.setAttribute("selected", '');
                    }
                }

                // var total = msg.total, page = parseInt(msg.page), data = msg.data;
                // var tbody = $("tbody");
                // tbody.empty();
                // if (total == 0){}
                // for (var r in data) {
                //     //change table data
                //     var tr = document.createElement('tr')
                //     var th = document.createElement('th');
                //     var td_scene = document.createElement('td');
                //     var td_type = document.createElement('td');
                //     var td_project = document.createElement('td');
                //     var td_time_added = document.createElement('td');
                //     th.textContent = data[r]['id'];
                //     td_scene.textContent = data[r]['project_scene'];
                //     td_type.textContent = data[r]['project_type'];
                //     td_project.textContent = data[r]['project'];
                //     td_time_added.textContent = data[r]['time_add'];
                //     th.setAttribute("scope", "row");
                //     tr.appendChild(th);
                //     tr.appendChild(td_scene);
                //     tr.appendChild(td_type);
                //     tr.appendChild(td_project);
                //     tr.appendChild(td_time_added);
                //     tbody[0].appendChild(tr);
                // }
                // // Update page navbar ui
                // update_ui(page, total);
            }, 
            error:function(){ 
                console.log("error"); 
            } 
        });
    });
})


