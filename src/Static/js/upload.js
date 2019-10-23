// Upload.js
$(document).on('submit', '#main_upload_form', function(e) {
	e.preventDefault();
	var form = $(this);
	var type = form.attr('method')
	var url = form.attr('action')
	var data = form.serialize();
    ajax({ 
        type:type, 
        url:url,
        data: data, 
        dataType:"text", 
        success:function(msg){ 
            alert(msg);
        }, 
        error:function(msg){ 
            alert(msg);
        } 
    });
});
