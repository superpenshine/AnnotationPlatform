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
    cur_page.placeholder = page.toString();
    cur_page.value = null;
    if (total <= 10){
        cur_page.disabled=true;
    } else {
        cur_page.disabled=null;
    }
    $("#sel-all-input")[0].checked = true;
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
        var td_preview = document.createElement('td');
        var img_preview = document.createElement('img');
        var td_checkbox = document.createElement('td');
        var div_checkbox = document.createElement('div');
        var input_checkbox = document.createElement('input');
        var label_checkbox = document.createElement('label');

        // Update preview
        hash = data[r]['hash']
        img_preview.classList.add("preview");
        img_preview.src = '/media/' + hash + '.jpg';
        img_preview.alt = hash + '.jpg';

        // Update checkbox bindings
        div_checkbox.classList.add("custom-control");
        div_checkbox.classList.add("custom-checkbox");
        input_checkbox.classList.add("custom-control-input");
        input_checkbox.classList.add("ckb");
        input_checkbox.classList.add('.active');
        input_checkbox.id = "customCheck" + i;
        input_checkbox.type = "checkbox";
        input_checkbox.value = data[r]['id'].toString();
        label_checkbox.classList.add("custom-control-label");
        label_checkbox.setAttribute ("for", "customCheck" + i);
        input_checkbox.setAttribute("checked", "");
        tbody[0].appendChild(tr);
        div_checkbox.appendChild(input_checkbox);
        div_checkbox.appendChild(label_checkbox);

        // Update table content
        th.setAttribute("scope", "row");
        th.textContent = data[r]['id'];
        td_scene.textContent = data[r]['project_scene'];
        td_type.textContent = data[r]['project_type'];
        td_project.textContent = data[r]['project'];
        td_time_added.textContent = data[r]['time_add'];
        td_preview.appendChild(img_preview);
        td_checkbox.appendChild(div_checkbox);

        tr.appendChild(th);
        tr.appendChild(td_scene);
        tr.appendChild(td_type);
        tr.appendChild(td_project);
        tr.appendChild(td_time_added);
        tr.appendChild(td_preview);
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
                    console.log("error"); 
                } 
            });
        }
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
                    opt.classList.add('gen');
                    opt.textContent = text;
                    tag.appendChild(opt);
                    if (text == mem['input-tags']) {
                        opt.selected = true;
                    }
                }
            }, 
            error:function(){ 
                console.log("error"); 
            } 
        });
    });
})

//Local memory to remember unchecked checkboxes
var unchecked = [];
//For selecting required items in the table
$(document).on('click','.ckb',function(e){
    var val = $(this).val();
    if($(this).is(':checked')){
        // Remove from unchecked
        unchecked = unchecked.filter(function(value, index, arr) {
            return value != val;
        });
    } else {
        // Add to checked
        unchecked.push(val);
    }
    console.log(unchecked);
});
// $(document).on('click','.ckb:not(:checked)',function(e){
//     unchecked.push($(this).val());
//     console.log(unchecked);
// });

//For select all button
$(document).on('click','#sel-all-input',function(e){
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
});

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
                console.log(msg);
            }, 
            error:function(msg){ 
                alert(msg);
            } 
        });
    });
})

$(document).on('click', ".preview", function(){
        $(".modal")[0].style.display = "block";
        $(".modal-content")[0].src = this.src;
        $(".modal-caption")[0].innerHTML = this.alt;
    });

// When the user clicks on <span> (x), close the modal
$(function(){
    $(".close").click(function(){
        $(".modal")[0].style.display = "none";
    });
})