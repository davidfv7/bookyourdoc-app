$('#loginForm').submit(function(e){
	e.preventDefault();
	var email = $("#user").val();
	var pass = $('#contra').val();
	var dataString="email="+email+"&password="+pass+"&login=";
	if($.trim(email).length>0 && $.trim(pass).lenth>0){
		$.ajax({
			type: "POST",
			url: "https://www.icone-solutions.com/doct/sqlOP.php",
			data: dataString,
			crossDomain: true,
			cache: false,
			beforeSend: function(){ $("#inicio").html('Conectando...');},
			success: function(data){
				if(data=="success"){
					localStorage.login="true";
					localStorage.email=email;
					window.location.href = "index.html";
				} else if (data=="failed"){
					alert("Error al entrar");
					$("#inicio").html('Inicio');
				}
			}
		});
	}
	return false;
});
