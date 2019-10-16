// $(document).ready(function () {
//     $('#search-button').on('click', function() {
//         console.log('aaab')
//     });
// })

function ask_server(){
    console.log('aaab')
}

page_num = 1;

$(function(){
    $("#main_search_form").submit(function(e) {
        console.log('triggered');
        e.preventDefault();

        var form = $(this);
        var url = form.attr('action');

        ajax({ 
            type:"POST", 
            url:url, 
            dataType:"json", 
            data:form.serialize(), 
            beforeSend:function(){ 
                //some js code 
            }, 
            success:function(msg){ 
                var total = msg.total, page = parseInt(msg.page), data = msg.data;
                var tbody = $("tbody");
                tbody.empty();
                if (total == 0){}
                for (var r in data) {
                    //change table data
                    var tr = document.createElement('tr')
                    var th = document.createElement('th');
                    var td_scene = document.createElement('td');
                    var td_type = document.createElement('td');
                    var td_project = document.createElement('td');
                    var td_time_added = document.createElement('td');
                    th.textContent = data[r]['id'];
                    td_scene.textContent = data[r]['project_scene'];
                    td_type.textContent = data[r]['project_type'];
                    td_project.textContent = data[r]['project'];
                    td_time_added.textContent = data[r]['time_add'];
                    th.setAttribute("scope", "row");
                    tr.appendChild(th);
                    tr.appendChild(td_scene);
                    tr.appendChild(td_type);
                    tr.appendChild(td_project);
                    tr.appendChild(td_time_added);
                    tbody[0].appendChild(tr);
                }
                //change ui
                console.log("Total number of records: "+total.toString());
                $("#total")[0].textContent = "Total number of records: "+total.toString();
                if (10*(page+1) > total){
                    $("#next-btn-li")[0].classList.add("disabled");
                } else {
                    $("#next-btn-li")[0].classList.remove("disabled");
                    $("#next-btn-a")[0].setAttribute("action", "show_page?page=" + (page+1).toString());
                }

                if (page == 1){
                    $("#prev-btn-li")[0].classList.add("disabled");
                } else {
                    $("#prev-btn-li")[0].classList.remove("disabled");
                    $("#prev-btn-a")[0].setAttribute("action", "show_page?page=" + (page-1).toString());
                }
            }, 
            error:function(){ 
                console.log("error"); 
            } 
        });
    });  
})

$(function(){
    $(".page-link").click(function(e) {
        var url = $(this).attr('action');
        ajax({ 
            type:"GET", 
            url:url,
            dataType:"json", 
            beforeSend:function(){ 
                //some js code 
            }, 
            success:function(msg){ 
                var total = msg.total, page = parseInt(msg.page), data = msg.data;
                var tbody = $("tbody");
                tbody.empty();
                if (total == 0){}
                for (var r in data) {
                    //change table data
                    var tr = document.createElement('tr')
                    var th = document.createElement('th');
                    var td_scene = document.createElement('td');
                    var td_type = document.createElement('td');
                    var td_project = document.createElement('td');
                    var td_time_added = document.createElement('td');
                    th.textContent = data[r]['id'];
                    td_scene.textContent = data[r]['project_scene'];
                    td_type.textContent = data[r]['project_type'];
                    td_project.textContent = data[r]['project'];
                    td_time_added.textContent = data[r]['time_add'];
                    th.setAttribute("scope", "row");
                    tr.appendChild(th);
                    tr.appendChild(td_scene);
                    tr.appendChild(td_type);
                    tr.appendChild(td_project);
                    tr.appendChild(td_time_added);
                    tbody[0].appendChild(tr);
                }
                //change ui
                //last page
                $("#curr-page")[0].textContent = page;
                if (10*(page+1) > total){
                    $("#next-btn-li")[0].classList.add("disabled");
                } else {
                    $("#next-btn-li")[0].classList.remove("disabled");
                    $("#next-btn-a")[0].setAttribute("action", "show_page?page=" + (page+1).toString());
                }

                if (page == 1){
                    $("#prev-btn-li")[0].classList.add("disabled");
                } else {
                    $("#prev-btn-li")[0].classList.remove("disabled");
                    $("#prev-btn-a")[0].setAttribute("action", "show_page?page=" + (page-1).toString());
                }
            }, 
            error:function(){ 
                console.log("error"); 
            } 
        });
    });
})
