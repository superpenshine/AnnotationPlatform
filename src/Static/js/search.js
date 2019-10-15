// $(document).ready(function () {
//     $('#search-button').on('click', function() {
//         console.log('aaab')
//     });
// })

function ask_server(){
    console.log('aaab')
}

$("#search-form").submit(function(e) {
    e.preventDefault();

    var form = $(this);
    var url = form.attr('action') + "/search_with_cond";

    ajax({ 
        type:"POST", 
        url:url, 
        dataType:"json", 
        data:form.serialize(), 
        beforeSend:function(){ 
            //some js code 
        }, 
        success:function(msg){ 
            var msg = JSON.parse(msg);
            var total = msg.total, page = msg.page, data = msg.data;
            for (var r in data) {
                //change table data
                //change ui
            }
        }, 
        error:function(){ 
            console.log("error") 
        } 
    })
});
