if (localStorage.getItem("user") != null) {
  var authUser = JSON.parse(localStorage.getItem("user"));
paymentList();
  if (authUser.type == "pac" || authUser.type == "pacientes") {
    $('#ntpc').text('');
    $('#ntpc').text('BIENVENIDO@ ' + authUser.name);
    $.mobile.navigate("#menu", {
      transition: "pop"
    });
  } else {
    $('#ntdr').text('');
    $('#ntdr').text('BIENVENIDO, DR.(A). ' + authUser.name);
    $.mobile.navigate("#menuD", {
      transition: "pop"
    });
  }
} else {
  $.mobile.navigate("#tutorial", {
    transition: "pop"
  });
}

Conekta.setPublicKey('key_BpifLpJUQoudFUeD45P8HCw');
Conekta.setLanguage("es");

function checkC() {
  var $form = $("#payForm");
  $form.find("button").prop("disabled", true);
  Conekta.Token.create($form, conektaSuccessResponseHandler, conektaErrorResponseHandler);
}

var conektaSuccessResponseHandler = function(token) {
  var $form = $("#payForm");
  //Inserta el token_id en la forma para que se envíe al servidor
  $form.append($("<input type='hidden' name='conektaTokenId' id='conektaTokenId'>").val(token.id));
  pay("#regFormP");
};

var conektaErrorResponseHandler = function(response) {
  var $form = $("#payForm");
  $form.find("button").prop("disabled", false);
  swal("Error", response.message_to_purchaser, "error");
  var $form = $("#payForm");
};

var datesArray = Array();
var calendar = "";

function getPac() {
  html = $("body").jqmData("html") || "";
  var user = JSON.parse(localStorage.getItem("user"));
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      patients: user.id
    },
    success: function(data) {
      $("#pacUl").empty();
      var docts = jQuery.parseJSON(data);
      for (var i = 0; i < docts.length; i++) {
        $("#pacUl").append(' <li><a class="showP" data-pac="' + docts[i][2] + '">' +
          '<img src="https://www.icone-solutions.com/doc/img/' + docts[i][1] + '" />' +
          '<span class="dname">' + docts[i][0] + '</span>' +
          '</a>' +
          '</li>')
      }
      if ($("#pacUl").hasClass('ui-listview')) {
        $("#pacUl").listview('refresh');
      }
    },
    error: function(data) {
      swal("Error", "Revisa tu conexión e intentalo de nuevo", "error");
    }
  });
}

function getCon() {
  var user = JSON.parse(localStorage.getItem("user"));
  $("#conUl").empty();
  user.offices.forEach(function(office) {
    $("#conUl").append(' <li>' + office.street + " Ext. " + office.ext + " Int. " + office.int + ", " + office.neighbourhood + ", " + office.municipality + ", " + office.state + '</li>');
  });
  $('.timePicker').datetimepicker({
    datepicker:false,
    format: "H:i",
    step:30,
    onSelectTime: function(time, $i){
      if($i.hasClass("closeT")){
        if($i.prev().val()==$i.val() || $i.prev().val()>$i.val() ){
          $i.val("");
        }
      }else{

        if($i.next().val()==$i.val() || $i.next().val()<$i.val() ){
           $i.next().val("");
        }
      }
    }
  });

  /*$.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      consulting: idu
    },
    success: function(data) {
      console.log(data);
      var docts = jQuery.parseJSON(data);
      for (var i = 0; i < docts.length; i++) {
        $("#conUl").append(' <li>' + docts[i] + '</li>')
      }
    },
    error: function(data) {
      swal("Error", "Revisa tu conexión e intentalo de nuevo", "error");
    }
  });*/
}

function getHP(idc, date) {
  var hours;
  /*  var weekend,
      saturday,
      sunday;*/
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    async: false,
    data: {
      rid: idc,
      datep: date
    },
    success: function(data) {
      var obj = jQuery.parseJSON(data);
      hours = obj[0];
      weekend = obj[1];
      saturday = obj[2];
      sunday = obj[3];
    },
    error: function() {
      swal("Error", "Revisa tu conexión e intentalo de nuevo", "error");
    }
  });
  var disabledp = [];
  if (weekend == "Cerrado") {
    disabledp.push(1);
    disabledp.push(2);
    disabledp.push(3);
    disabledp.push(4);
    disabledp.push(5);
  }
  if (saturday == "Cerrado") {
    disabledp.push(6);
  }
  if (sunday == "Cerrado") {
    disabledp.push(0);
  }
  d = new Date();
  todaytime = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  $('#timeP').datetimepicker({
    formatDate: 'Y-m-d',
    formatTime: 'H:i',
    defaultTime: "9:00",
    disabledWeekDays: disabledp,
    allowTimes: hours,
    minDate: todaytime,
    startDate: todaytime,
    onSelectDate: function(ct, $i) {
      var d = new Date(ct);
      html = $(this).jqmData("html") || "";
      $.mobile.loading("show", {
        text: "Cargando Horarios",
        textVisible: true,
        theme: "b",
        textonly: false,
        html: html
      });
      var now = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      $.ajax({
        url: "https://www.icone-solutions.com/doct/sqlOP.php",
        type: "POST",
        data: {
          sdate: now,
          cd: 1
        },
        success: function(data) {
          $.mobile.loading("hide");
          var hours = jQuery.parseJSON(data);
          $i.datetimepicker('setOptions', {
            allowTimes: hours
          });
        },
        error: function() {
          swal("Error", "No se ha podido conectar al servidor, revisa tu conexión", "error");
        }
      });
    }
  });
}

function getPD() {
  var user = JSON.parse(localStorage.getItem("user"));
  console.log(user);
  //var datat = localStorage.getItem("tipo");
  if (user.type == "pac" || user.type == "pacientes") {
    $("#nombreU").val(user.name);
    $("#mailU").val(user.mail);
    $("#apellU").val(user.last_names);
    $("#telU").val(user.info.phone);
    $("#sexoU").val(user.sex);

    if (user.info.civil_state == "") {

      $("#ecU").val("Soltero");
    } else {
      $("#ecU").val(user.info.civil_state);
    }
    var selected = user.info.ahf.split(",");

    $.each(selected, function(i, v) {

      $("#ahf > option[value='" + v + "']").prop("selected", true);

    });
     selected = user.info.hns.split(",");
    $.each(selected, function(i, v) {

      $("#hns > option[value='" + v + "']").prop("selected", true);

    });

    $("#edadU").val(user.info.age);

    $("#pacP").attr("src", "https://www.icone-solutions.com/doc/img/" + user.info.photo);
    $('#sexoU').selectmenu('refresh', true);
    $('#ecU').selectmenu('refresh', true);
    $('#ahf').selectmenu('refresh', true);
    $('#hns').selectmenu('refresh', true);
  } else {
    console.log(user);
    $("#nombreD").val(user.name);
    $("#apellD").val(user.last_names);
    $("#mailD").val(user.mail);
    $("#telD").val(user.info.phone);
    $("#costoD").val(user.info.price);

    $("#docP").attr("src", "https://www.icone-solutions.com/doc/img/"+user.info.photo);
  }
  /*$.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "POST",
      data: {
          userPD: user,
      },
      success: function(data) {

          var obj = jQuery.parseJSON(data);
          datosp = obj;
          if (datat == "pac") {
              $("#nombreU").val(user.name);
              $("#mailU").val(user.mail);
              $("#telU").val(obj[0][2]);
              $("#sexoU").val(obj[0][3]);
              $("#ecU").val(obj[0][4]);
              $("#edadU").val(obj[0][5]);
              $("#pacP").attr("src", "https://icone-solutions.com/doct/img/" + obj[0][6]);
              $('#sexoU').selectmenu('refresh', true);
              $('#ecU').selectmenu('refresh', true);
          } else {
              $("#nombreD").val(obj[0][0]);
              $("#mailD").val(obj[0][1]);
              $("#telD").val(obj[0][2]);

              $("#docP").attr("src", "https://icone-solutions.com/doct/img/" + obj[0][3]);
          }


      },
      error: function(data) {
          $.mobile.loading("hide");
          swal("Error", "Revisa tu conexión e intentalo de nuevo", "error");
      }
  });*/
}

function getEP() {
  var paci = localStorage.getItem("usi");
  var datap = localStorage.getItem("tipo");

  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      paci: paci,
      datap: datap
    },
    success: function(data) {
      console.log(data);
      var obj = jQuery.parseJSON(data);
      datosp = obj;
      $("#histo").html(obj[0][0]);
    },
    error: function(data) {
      $.mobile.loading("hide");
      swal("Error", "Revisa tu conexión e intentalo de nuevo", "error");
    }
  });
}

function getED() {
  var user = JSON.parse(localStorage.getItem("user"));
  $("#uniD").val(user.info.college);
  $("#espD").val(user.info.specialty);
  $("#cedD").val(user.info.cedula);
  $("#expL").empty();
  user.info.experience.forEach(function(exp) {
    $("#expL").append("<li><div class='edate'>" + exp[0] + "</div> <div class='edesc'>" + exp[1] + ". " + exp[2] + "</div></li>")
  });


  /*$.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "POST",
      data: {
          idm: idm,
      },
      success: function(data) {

          var obj = jQuery.parseJSON(data);
          var exp = obj[0][3];

          $("#uniD").val(obj[0][1]);
          $("#espD").val(obj[0][0]);
          $("#cedD").val(obj[0][2]);
          for (var i = 0; i < exp.length; i++) {
              $("#expL").append("<li><div class='edate'>" + exp[i][0] + "</div> <div class='edesc'>" + exp[i][1] + ". " + exp[i][2] + "</div></li>")
          }


      },
      error: function(data) {
          $.mobile.loading("hide");
          swal("Error", "Revisa tu conexión e intentalo de nuevo", "error");
      }
  });*/
}
var citap = 0;
var fechap = "";

function getIDa() {

  var user = JSON.parse(localStorage.getItem("user"));
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      gd: user.id
    },
    async: false,
    success: function(data) {

      $("#citasUL").empty();
      var appointments = JSON.parse(data);
      appointments.forEach(function(appointment) {
        var color = "";
        var color2 = "";
        if (appointment.payment == "Liberado") {
          color = "blueb";
          color2 = "greenp";
        } else {
          color = "orangeb";
          color2 = "orangep"
        }
        if (appointment.date != "") {
          var f = appointment.date;
          var fecha = f.split('-');
          var e = fecha[2].split('T');
        }
        $("#citasUL").append(' <li class="' + color + '">' +
          '<div class="flexb">' +
          '<div class="idate"><div style="background-image: url(' + appointment.photo + '");" class="doci"></div><div class="info_d">' +
          '<h1>Dr(a). ' + appointment.name + ' <hr></h1>' +
          '<p>' + appointment.specialty + '</p>' +
          '<p>' + e[0] + '/' + fecha[1] + '/' + fecha[0] + ' ' + e[1] + '</p>' +
          '<p class="' + color2 + '">$' + appointment.price + ' ' + appointment.payment + '</p>' +
          '</div></div>' +
          '</div>' +

          '</li>');
      });
      if ($("#citasUL").hasClass('ui-listview')) {
        $("#citasUL").listview('refresh');
      }


    },

    error: function(data) {
      console.log(data);
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}



function getSchedule() {
  datesArray = Array();
  var user = JSON.parse(localStorage.getItem("user"));
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      gd: user.id
    },
    async: false,
    success: function(data) {

      var appointments = jQuery.parseJSON(data);
      appointments.forEach(function(appointment) {
        var temp = {
          start: appointment.date,
          title: appointment.name,
          id: appointment.id
        }
        datesArray.push(temp);
        var color = "";
        var color2 = "";
        if (appointment.payment == "Liberado") {
          color = "blueb";
          color2 = "greenp";
        } else {
          color = "orangeb";
          color2 = "orangep"
        }
      });


      $('#calendars').fullCalendar({
        locale: 'es',
        header: {
          left: 'prev,next',
          center: 'title',
          right: 'agendaWeek,agendaDay,listWeek'
        },
        views: {
          listWeek: {
            buttonText: 'Lista',
            noEventsMessage: 'No hay citas por el momento.'
          },
          agendaWeek: {
            buttonText: 'Semana'
          },
          agendaDay: {
            buttonText: 'Día'
          }
        },

        eventClick: function(calEvent, jsEvent, view) {

          if ($(window).width() < 500) {
            if (!$(view.el[0]).hasClass("fc-month-view")) {
              citap = calEvent.id;
              fechap = new Date(calEvent.start._d);
              $('#modalP').iziModal('startLoading');
              $('#modalP').iziModal('open');
            }
          } else {
            citap = calEvent.id;
            fechap = new Date(calEvent.start._d);
            $('#modalP').iziModal('startLoading');
            $('#modalP').iziModal('open');
          }


        },
        defaultView: 'agendaWeek',
        events: datesArray
      });


    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function getAgenda() {
  datesArray = Array();
  var user = JSON.parse(localStorage.getItem("user"));
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      gdo: user.id
    },
    async: false,
    success: function(data) {

      var obj = jQuery.parseJSON(data);
      for (var i = 0; i < obj.length; i++) {
        var temp = {
          start: obj[i][0],
          title: obj[i][2],
          id: obj[i][5]
        }
        datesArray.push(temp);


      }

      $('#calendarsD').fullCalendar({
        locale: 'es',
        header: {
          left: 'prev,next',
          center: 'title',
          right: 'agendaWeek,agendaDay,listWeek'
        },
        views: {
          listWeek: {
            buttonText: 'Lista'
          },
          agendaWeek: {
            buttonText: 'Semana'
          },
          agendaDay: {
            buttonText: 'Día'
          }
        },
        eventClick: function(calEvent, jsEvent, view) {
          citap = calEvent.id;
          fechap = new Date(calEvent.start._d);
          $('#modalD').iziModal('startLoading');
          $('#modalD').iziModal('open');
        },
        defaultView: 'agendaWeek',
        events: datesArray
      });
    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function paymentList() {
  console.log("lalala");
  var user = JSON.parse(localStorage.getItem("user"));
  var pl = user.id
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      pl: pl
    },
    async: false,
    success: function(data) {

      var obj = jQuery.parseJSON(data);
      for (var i = 0; i < obj.length; i++) {
        if (obj[i][6] == "Liberado") {
          color = "greenB";
          color2 = "greenp";
        } else {
          color = "orangeb";
          color2 = "orangep"
        }

        $("#paymentL").append('<li class="'+color+'">' +
          '<div class="flexb">' +
          '<div class="idate"><div class="info_pay">' +
          '<p>Cita con Dr(a). ' + obj[i][2] + ' </p>' +
          '<p>' + obj[i][1] + ' </p>' +
          '<p class="'+color2+'">Costo: <i>$' + obj[i][3] + '</i> '+ obj[i][6] +'</p>' +
          '</div></div>' +
          '</div>' +

          '</li>');



      }
      if ($("#paymentL").hasClass('ui-listview')) {
        $("#paymentL").listview('refresh');

      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}


function getScheduleP() {
  var gd = localStorage.getItem("usi");
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      gdp: gd
    },
    async: false,
    success: function(data) {
      var obj = jQuery.parseJSON(data);
      $("#citasRUL").empty();
      if (obj.length == 0) {
        $("#citasRUL").append(' <li >' +
          '<div class="flexb">' +
          '<div class="idate"><div class="info_d">' +
          '<h1>Aún no hay citas <hr></h1>' +
          '</div>' +

          '</li>');
      }
      for (var i = 0; i < obj.length; i++) {



        $("#citasRUL").append(' <li >' +
          '<div class="flexb">' +
          '<div class="idate"><div style="background-image: url(' + obj[i][4] + '");" class="doci"></div><div class="info_d">' +
          '<h1>Dr(a). ' + obj[i][2] + ' <hr></h1>' +
          '<p>' + obj[i][5] + '</p>' +
          '<p>' + obj[i][1] + '</p>' +
          '</div></div>' +
          '</div>' +

          '</li>');



      }
      if ($("#citasRUL").hasClass('ui-listview')) {
        $("#citasRUL").listview('refresh');

      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function deshi() {
  cordova.InAppBrowser.open('https://icone-solutions.com/doct/pdfprueba/prueba.php', '_system', 'location=yes');
  //window.open('https://icone-solutions.com/doct/pdfprueba/prueba.php', '_system', 'location=yes');
}

function pay() {
  var user = JSON.parse(localStorage.getItem("user"));
  var form = new FormData($("#payForm")[0]);
  var mcon = $("#mcon").val();
  var horario = $("#default_datetimepicker").val().toString().split(" ");
  var inputr = document.getElementById("radiograf"),
    inputre = document.getElementById("recetaf"),
    inpute = document.getElementById("elab");

  form.append("fecha", horario[0]);
  form.append("hora", horario[1]);
  form.append("radio", inputr.files[0]);
  form.append("recipe", inputre.files[0]);
  form.append("elab", file = inpute.files[0]);
  form.append("patient", user.id);
  form.append("mcon", mcon);
  $.ajax({
    url: "https://www.icone-solutions.com/doc/conekta.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
      $("#payForm").find("button").prop("disabled", false);

      if (data.toString() == "1") {
        $("#radiograf").val("");
        $("#receta").val("");
        $("#elab").val("");
        $("#default_datetimepicker").val("");
        console.log(horario);
        var newdate = horario[0] + " " + horario[1];
        var newEv = [{

          start: newDate,
          title: "Nueva Cita"
        }];
        $("#calendars").fullCalendar('addEventSource', newEv);
        swal("Listo", "Tu cita fue registrada exitosamente.", "success");
        $.mobile.navigate("#calendar_p", {
          transition: "slide",
          info: "info about the #foo hash"
        });


      } else {
        var mes = "";

        mes = data.toString();

        swal("Error", mes, "error");
      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function paynt() {
  var form = new FormData($("#payForm")[0]);
  var user = JSON.parse(localStorage.getItem("user"));
  var mcon = $("#mcon").val();
  var horario = $("#default_datetimepicker").val().toString().split(" ");
  var inputr = document.getElementById("radiograf"),
    inputre = document.getElementById("recetaf"),
    inpute = document.getElementById("elab");

  form.append("fecha", horario[0]);
  form.append("hora", horario[1]);
  form.append("radio", inputr.files[0]);
  form.append("recipe", inputre.files[0]);
  form.append("elab", inpute.files[0]);
  form.append("patient", user.id);
  form.append("mcon", mcon);
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
      data = JSON.parse(data);
      if (data.success) {
        $("#radiograf").val("");
        $("#receta").val("");
        $("#elab").val("");
        $("#mcon").val("");
        $("#default_datetimepicker").val("");
        var newDate = horario[0] + " " + horario[1];
        var newEv = [{
          start: newDate,
          title: "Nueva Cita",
          id: data.appointment
        }];
        $("#calendars").fullCalendar('addEventSource', newEv);
        swal("Listo", "Tu cita fue registrada exitosamente.", "success");
        $.mobile.navigate("#calendar_p", {
          transition: "slide",
          info: "info about the #foo hash"
        });


      } else {



        swal("Error", data.message, "error");
      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function updateD() {
  var form = new FormData($("#datosForm")[0]);
  form.append("userm", JSON.parse(localStorage.getItem("user")).id);
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {

      data = JSON.parse(data);
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        swal("Listo", "Tus datos han sido modificados.", "success");


      } else {



        swal("Error", "No se han podido modificar tus datos, revisa tu conexión e intentalo de nuevo", "error");
      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function updateDD() {
  var form = new FormData($("#datosdForm")[0]);

  form.append("userm", JSON.parse(localStorage.getItem("user")).id);
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {

      data = JSON.parse(data);
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));


        swal("Listo", "Tus datos han sido modificados.", "success");


      } else {



        swal("Error", "No se han podido modificar tus datos, revisa tu conexión e intentalo de nuevo", "error");
      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function updateDE() {
  var form = new FormData($("#datoseForm")[0]);
  form.append("userm", localStorage.getItem("usi"));
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
      if (data.toString() == "1") {

        var nl = $("#expD").val().split("/");
        $("#expL").append("<li><div class='edate'>" + nl[0] + "</div> <div class='edesc'>" + nl[1] + ". " + nl[2] + "</div></li>")
        swal("Listo", "Tus datos han sido modificados.", "success");


      } else {



        swal("Error", "No se han podido modificar tus datos, revisa tu conexión e intentalo de nuevo", "error");
      }

    },

    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function updateCD() {
  var form = new FormData($("#datosConsul")[0]);
  var flag=true;
  var user = JSON.parse(localStorage.getItem("user"));
  form.append("userm", user.id);


  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
      data = JSON.parse(data);

      if (data.success) {
        user.offices = data.offices;
        localStorage.setItem("user",JSON.stringify(user));
        swal("Listo", "Tus datos han sido guardados.", "success");
      } else {
        //swal("Error","No se han podido modificar tus datos, revisa tu conexión e intentalo de nuevo","error");
        swal("Error", data.message, "error");
      }
    },
    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }
  });
}

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $(input).prev().find(".profileimg").attr('src', e.target.result);
    }

    reader.readAsDataURL(input.files[0]);
  }
}


var connectionStatus = false;

function reSchedule(appointment) {
  var form = new FormData($("#repForm")[0]);

  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    error: function(xhr, settings, exception) {

      swal("Error", "Revisa tu conexión a internet.", "error")
    },
    success: function(data) {
      data = JSON.parse(data);
      if (data.success) {
        var newdate = data.appointment.date + " " + data.appointment.hour;
        var newEv = [{
          start: newdate,
          title: "Nueva Cita",
          id: appointment
        }];
        $("#calendars").fullCalendar('removeEvents', [appointment]);
        $("#calendars").fullCalendar('addEventSource', newEv);

        $('.modalSch').iziModal('close');
        swal("Listo", "Tu cita ha sido reprogramada.", "success");
      } else {
        $('.modalSch').iziModal('close');

        swal("Listo", "Ocurrio un error al hacer tu cambio, por favor inténtalo de nuevo.", "error");
      }

    }
  });
}

function reScheduled(appointment) {
  var form = new FormData($("#repdForm")[0]);

  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    error: function(xhr, settings, exception) {

      swal("Error", "Revisa tu conexión a internet.", "error")
    },
    success: function(data) {
      data = JSON.parse(data);
      if (data.success) {
        var newdate = data.appointment.date + " " + data.appointment.hour;
        var newEv = [{
          start: newdate,
          title: "Nueva Cita",
          id: appointment
        }];
        $("#calendarsD").fullCalendar('removeEvents', [appointment]);
        $("#calendarsD").fullCalendar('addEventSource', newEv);

        $('.modalSch').iziModal('close');
        swal("Listo", "Tu cita ha sido reprogramada.", "success");
      } else {
        $('.modalSch').iziModal('close');

        swal("Listo", "Ocurrio un error al hacer tu cambio, por favor inténtalo de nuevo.", "error");
      }

    }
  });
}

function login() {

  var form = new FormData($("#loginForm")[0]);

  //form.append("regID",localStorage.getItem('registrationId'));
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    error: function(xhr, settings, exception) {
      swal("Error", "Revisa tu conexión a internet.", "error")
    },
    success: function(data) {
      $("#mailLogin").val("");
      $("#passLogin").val("");
      $.mobile.loading("hide");
      data = jQuery.parseJSON(data);
      if (data.success) {

        localStorage.setItem("user", JSON.stringify(data.user));
        var user = JSON.parse(localStorage.getItem("user"));

        if (data.user.type == "pac") {

          //$(".bien").html(jobj[1]);
          $.mobile.navigate("#menu", {
            transition: "slide",
            info: "info about the #foo hash"
          });
          $('#ntpc').text('');
          $('#ntpc').text('BIENVENID@ ' + user.name);
        } else {

          $.mobile.navigate("#menuD", {
            transition: "slide",
            info: "info about the #foo hash"
          });
          $('#ntdr').text('');
          $('#ntdr').text('BIENVENIDO, DR.(A). ' + user.name);
        }

      } else {
        swal("Error", "Usuario o contraseña incorrectos", "error");
      }
    },
    error: function(error) {
      console.log(error);
      $.mobile.loading("hide");
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }
  });
}

function recup() {
  var u = $('#usua').val();
  console.log(u);
  var t = $('#tipoR').val();
  console.log(t);
  var form = new FormData($('#recupForm')[0]);
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    error: function(xhr, settings, exception) {
      swal("Error", "Revisa tu conexión a internet.", "error")
    },
    success: function(data) {
      console.log(data);
      $.mobile.loading("hide");
      //$("#logac").prop("disabled",false);
      //if(data.toString()!=="0"){
      var jobj = jQuery.parseJSON(data);
      //if(data.toString()!=="0"){
      if (jobj[0] !== "0") {
        user = jobj[3];
        usi = jobj[0];
        if (jobj.length == "5") {
          dop = jobj[5];
        } else {
          dop = jobj[6];
        }
        /*var datos = data.toString().split(",");
        user = datos[0];
        usi = datos[1];*/
        $('#iduser').val(user);
        $('#tipou').val(dop);
        $.mobile.navigate("#contra", {
          transition: "slide",
          info: "info about the #foo hash"
        });

      } else {
        swal("Error", "El usuario que buscas no existe", "error");
      }
    },
    error: function() {
      $.mobile.loading("hide");
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }
  });
}

function nuevac() {
  var form = new FormData($('#contraForm')[0]);
  var pass = $('#pass3').val();
  var pass1 = $('#pass4').val();
  if (pass == pass1) {
    $.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "POST",
      data: form,
      contentType: false,
      cache: false,
      processData: false,
      error: function(xhr, settings, exception) {
        swal("Error", "Revisa tu conexión a internet.", "error")
      },
      success: function(data) {
        console.log(data);
        $.mobile.loading("hide");
        //$("#logac").prop("disabled",false);
        if (data.toString() === "0") {
          $.mobile.navigate("#inicio", {
            transition: "slide",
            info: "info about the #foo hash"
          });

        } else {
          swal("Error", "No se pudo actualizar tu contraseña revisa tus datos", "error");
        }
      },
      error: function() {
        $.mobile.loading("hide");
        swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
      }
    });
  } else {
    $.mobile.loading("hide");
    swal("Error", "Las contraseñas no coinciden", "error");
  }
}

function register() {
  var form = new FormData($("#regForm")[0]);
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: form,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
      console.log(data);
      data = jQuery.parseJSON(data);
      if (data.success) {
        $("#nombre").val("");
        $("#apellidos").val("");
        $("#mailR").val("");
        $("#pass1").val("");
        $("#pass2").val("");
        localStorage.setItem("user", JSON.stringify(data.user));
        var user = JSON.parse(localStorage.getItem("user"));

        //var datos = data.toString().split(",");
        if (user.type == "pacientes") {
          $('#ntpc').text('');
          $('#ntpc').text('BIENVENID@ ' + user.name);
          swal("Listo", "Tu usuario ha sido registrado exitosamente.", "success");


          $.mobile.navigate("#menu", {
            transition: "slide",
            info: "info about the #foo hash"
          });
        } else {

          swal("Listo", "Tu usuario ha sido registrado exitosamente.", "success");


          $('#ntdr').text('');
          $('#ntdr').text('BIENVENIDO, DR.(A). ' + user.name);
          $.mobile.navigate("#menuD", {
            transition: "slide",
            info: "info about the #foo hash"
          });
        }


      } else if (data.toString() == "Error") {
        //swal("Error",data.toString(),"error");
        swal("Error", "Este usuario ya ha sido registrado.", "error");
      } else if (data.toString() == "Error1") {
        swal("Error", "Este usuario ya ha sido registrado como doctor.", "error");
      } else if (data.toString() == "Error2") {
        swal("Error", "Este usuario ya ha sido registrado como paciente.", "error");
      }
      $("#rega").prop("disabled", false);
    },
    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }

  });
}

function cancelC(idc) {
  $.ajax({
    url: "https://www.icone-solutions.com/doct/sqlOP.php",
    type: "POST",
    data: {
      idc: idc
    },
    success: function(data) {
      if (data.toString() == "1") {
        if ($("#calendars").is(":visible")) {
          $("#calendars").fullCalendar('removeEvents', [idc])
        } else {
          $("#calendarsd").fullCalendar('removeEvents', [idc])
        }

        swal("Listo", "Tu cita ha sido eliminada exitosamente.", "success");
      } else {
        swal("Ups!", "Tu cita no ha podido ser eliminada.", "error");
      }
    },
    error: function() {
      swal("Error", "Actualmente tu dispositivo no cuenta con una conexión a internet", "error");
    }
  });
}

$(document).ready(function() {

  if (localStorage.getItem("user") == null) {
    $.mobile.navigate("#tutorial", {
      transition: "slide",
      info: "info about the #foo hash"
    });

    $('#tutorial4').on('swipeleft', function(event) {

      $.mobile.navigate("#inicio", {
        transition: "pop",
        info: "info about the #foo hash"
      });

    });
  } else {
    if (localStorage.getItem("tipo") == "doc") {
      $('#tutorial4').on('swipeleft', function(event) {

        $.mobile.navigate("#confD", {
          transition: "pop",
          info: "info about the #foo hash"
        });

      });
      $('#ntdr').text('');
      $('#ntdr').text('BIENVENIDO, DR.(A). ' + localStorage.getItem("comp"));
    } else {
      $('#tutorial4').on('swipeleft', function(event) {

        $.mobile.navigate("#confP", {
          transition: "pop",
          info: "info about the #foo hash"
        });
        $('#ntpc').text('');
        $('#ntpc').text('BIENVENID@ ' + localStorage.getItem("comp"));
      });
    }
  }

  /*$('#deshi').on('click', function(e){
  	e.preventDefault();
  	var usuario = localStorage.getItem("usi");
  	console.log("hola");
  	cordova.InAppBrowser.open('https://icone-solutions.com/doct/pdfprueba/prueba.php?id=usuario', '_system', 'location=yes');
  });*/

  $("#modalP").iziModal({
    history: false,
    overlayClose: false,
    width: 600,
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    transitionIn: 'bounceInDown',
    transitionOut: 'bounceOutDown',
    onOpened: function(modal) {


      $.ajax({
        url: "https://www.icone-solutions.com/doct/sqlOP.php",
        type: "POST",
        data: {
          citap: citap
        },
        success: function(data) {

          var jobj = jQuery.parseJSON(data);
          modal.stopLoading();
          if (jobj[0][0] != "") {
            var f = jobj[0][0];
            var fecha = f.split('-');
          }
          $(".doctN").text(jobj[0][2]);
          $(".doctM").text(jobj[0][5]);
          $(".doctPh").text(jobj[0][4]);
          $(".cdate").text(fecha[2] + '/' + fecha[1] + '/' + fecha[0]);
          $(".hdate").text(jobj[0][1]);
          $("#dateId").val(citap);
          $(".citaI").css("background-image", "url(" + jobj[0][3] + ")");
          //////////////////////////////////


          $.ajax({
            url: "https://www.icone-solutions.com/doct/sqlOP.php",
            type: "POST",
            data: {
              doctorR: jobj[0][6],
            },
            success: function(response) {
              console.log(response);
              var docts = jQuery.parseJSON(response);

              var i;
              //var c = docts[0][16].length;
              //var d = docts[0][16];
              //console.log(c);

              weekend = docts.lvm;
              saturday = docts.sm;
              sunday = docts.dm;
              allowed = docts.hours;
              var d = new Date();
              var dd = d.getDate();
              var mm = d.getMonth() + 1; //January is 0!

              var yyyy = d.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }

              todaytp = yyyy + '-' + mm + '-' + dd;
              if (allowed.length == 0) {

                disabledt = [todaytp];
                dd = '0' + (d.getDate() + 1);
                todaytp = yyyy + '-' + mm + '-' + dd;

              } else {
                disabledt = [];
              }
              var disabled = [];
              var allowedt = [];
              if (weekend[0] == "Cerrado") {
                disabled.push(1);
                disabled.push(2);
                disabled.push(3);
                disabled.push(4);
                disabled.push(5);
              }
              if (saturday[0] == "Cerrado") {
                disabled.push(6);
              }
              if (sunday[0] == "Cerrado") {
                disabled.push(0);
              }
              $('#timePs').datetimepicker({
                formatDate: 'Y-m-d',
                formatTime: 'H:i',
                defaultTime: "9:00",
                disabledWeekDays: disabled,
                allowTimes: allowed,
                minDate: todaytp,
                startDate: todaytp,
                onSelectDate: function(ct, $i) {

                  var d = new Date(ct);
                  html = $(this).jqmData("html") || "";
                  $.mobile.loading("show", {
                    text: "Cargando Horarios",
                    textVisible: true,
                    theme: "b",
                    textonly: false,
                    html: html
                  });
                  var now = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                  $.ajax({
                    url: "https://www.icone-solutions.com/doct/sqlOP.php",
                    type: "POST",
                    data: {
                      sdate: now,
                      cd: 1
                    },
                    success: function(data) {

                      $.mobile.loading("hide");
                      allowed = jQuery.parseJSON(data);

                      $i.datetimepicker('setOptions', {
                        allowTimes: allowed
                      });

                    },
                    error: function() {
                      swal("Error", "No se ha podido conectar al servidor, revisa tu conexión", "error");
                    }
                  })


                }
              });


            }
          });
        },
        error: function() {
          modal.stopLoading();
          $('#modalP').iziModal('close');
        }
      })

    },
    onClosed: function() {
      $('#timePs').datetimepicker("destroy");
      //console.log('onClosed');
    }
  });
  $("#modalD").iziModal({
    group: 'grupo1',
    history: false,
    overlayClose: false,
    width: 600,
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    transitionIn: 'bounceInDown',
    transitionOut: 'bounceOutDown',
    onOpened: function(modal) {
      $.ajax({
        url: "https://www.icone-solutions.com/doct/sqlOP.php",
        type: "POST",
        data: {
          citad: citap
        },
        success: function(data) {
          var jobj = jQuery.parseJSON(data);
          modal.stopLoading();
          var user = JSON.parse(localStorage.getItem("user"));
          console.log(user);
          $(".doctN").text(jobj[0][2]);
          $(".doctM").text(jobj[0][5]);
          $(".doctPh").text(jobj[0][4]);
          $(".cdate").text(jobj[0][0]);
          $(".hdate").text(jobj[0][1]);
          $("#datedId").val(citap);
          $(".citaI").css("background-image", "url(" + jobj[0][3] + ")");
          /////////////////////
          $.ajax({
            url: "https://www.icone-solutions.com/doct/sqlOP.php",
            type: "POST",
            data: {
              doctorR: user.id,
            },
            success: function(response) {
              console.log(response);
              var docts = jQuery.parseJSON(response);

              var i;
              //var c = docts[0][16].length;
              //var d = docts[0][16];
              //console.log(c);

              weekend = docts.lvm;
              saturday = docts.sm;
              sunday = docts.dm;
              allowed = docts.hours;
              var d = new Date();
              var dd = d.getDate();
              var mm = d.getMonth() + 1; //January is 0!

              var yyyy = d.getFullYear();
              if (dd < 10) {
                dd = '0' + dd;
              }
              if (mm < 10) {
                mm = '0' + mm;
              }

              todaytp = yyyy + '-' + mm + '-' + dd;
              if (allowed.length == 0) {

                disabledt = [todaytp];
                dd = '0' + (d.getDate() + 1);
                todaytp = yyyy + '-' + mm + '-' + dd;

              } else {
                disabledt = [];
              }
              var disabled = [];
              var allowedt = [];
              if (weekend[0] == "Cerrado") {
                disabled.push(1);
                disabled.push(2);
                disabled.push(3);
                disabled.push(4);
                disabled.push(5);
              }
              if (saturday[0] == "Cerrado") {
                disabled.push(6);
              }
              if (sunday[0] == "Cerrado") {
                disabled.push(0);
              }
              $('#timeD').datetimepicker({
                formatDate: 'Y-m-d',
                formatTime: 'H:i',
                defaultTime: "9:00",
                disabledWeekDays: disabled,
                allowTimes: allowed,
                minDate: todaytp,
                startDate: todaytp,
                onSelectDate: function(ct, $i) {

                  var d = new Date(ct);
                  html = $(this).jqmData("html") || "";
                  $.mobile.loading("show", {
                    text: "Cargando Horarios",
                    textVisible: true,
                    theme: "b",
                    textonly: false,
                    html: html
                  });
                  var now = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                  $.ajax({
                    url: "https://www.icone-solutions.com/doct/sqlOP.php",
                    type: "POST",
                    data: {
                      sdate: now,
                      cd: 1
                    },
                    success: function(data) {

                      $.mobile.loading("hide");
                      allowed = jQuery.parseJSON(data);

                      $i.datetimepicker('setOptions', {
                        allowTimes: allowed
                      });

                    },
                    error: function() {
                      swal("Error", "No se ha podido conectar al servidor, revisa tu conexión", "error");
                    }
                  })


                }
              });


            }
          });
        },
        error: function() {
          modal.stopLoading();
          $('#modalD').iziModal('close');
        }
      })

    },
    onClosed: function() {
      //console.log('onClosed');
    }
  });

  $("#modalP, #modalD").on('click', 'header a', function(event) {
    event.preventDefault();
    var $this = $(this);
    var index = $this.index();
    $this.addClass('active').siblings('a').removeClass('active');

    var $sections = $this.closest('div').find('.sections');
    var $currentSection = $this.closest("div").find("section").eq(index);
    //var $nextSection = $this.closest("div").find("section").eq(index).siblings('section');

    $sections.css('height', $currentSection.innerHeight());

    function changeHeight() {
      $this.closest("div").find("section").eq(index).fadeIn().siblings('section').fadeOut(100);
    }

    if ($currentSection.innerHeight() > $sections.innerHeight()) {
      changeHeight();
    } else {
      setTimeout(function() {
        changeHeight();
      }, 150);
    }

    if ($this.index() === 0) {
      $("#modalP .iziModal-content .icon-close").css('background', '#ddd');
    } else {
      $("#modalP .iziModal-content .icon-close").attr('style', '');
    }
  });
  $(function() {
    Inputmask.extendDefinitions({
      'c': {
        validator: "[A-z0-9 ]*",
        cardinality: 1,
      }
    });
    $("#expD").inputmask({
      mask: "9999 / c{5,256} / c{11,256}",
      onincomplete: function() {
        //$(this).val("")
      }
    });
    //  $("#expD").inputmask("9999 / *{5,256} / *{11,256}");
    $("#card").inputmask("9999 9999 9999 9999", {
      "placeholder": "0000 0000 0000 0000"
    });
    $("#cvv").inputmask("999", {
      "placeholder": "000"
    });
    $("#expdate").inputmask("99/9999", {
      "placeholder": "mm/aaaa"
    });
    $("[data-mask]").inputmask();

  });
  document.addEventListener("backbutton", function(e) {


    if ($.mobile.activePage.is('#inicio') || $.mobile.activePage.is('#land')) {

    } else {
      navigator.app.backHistory()
    }
  }, false);

  $('#recentA').on('pagebeforeshow', function(event) {


    getScheduleP();

  });
  $('#important_d').on('pagebeforeshow', function(event) {


    getIDa();

  });
  $('#calendar_p').on('pagebeforeshow', function(event) {


    getSchedule();


  });
  $('#calendar_p').on('pageshow', function(event) {

    $('#calendars').fullCalendar("rerenderEvents");
  });

  $('#agenda').on('pagebeforeshow', function(event) {
    $('#calendars').fullCalendar("rerenderEvents");

    getAgenda();

  });
  $('#agenda').on('pageshow', function(event) {
    $('#calendarsD').fullCalendar("rerenderEvents");



  });
  $('#profileP').on('pageshow', function(event) {


    getPD();

  });
  $('#profileD').on('pageshow', function(event) {


    getPD();
    getED();
  });
  $('#expediente').on('pageshow', function(event) {
    getEP();
  });
  $('#patient_list').on('pagebeforeshow', function(event) {


    getPac();

  });

  $('#consultorio').on('pagebeforeshow', function(event) {
    getCon();
  });

  $('#tutorial').on('swipeleft', function(event) {

    $.mobile.navigate("#tutorial1", {
      transition: "slide",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial1').on('swipeleft', function(event) {

    $.mobile.navigate("#tutorial2", {
      transition: "slide",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial1').on('swiperight', function(event) {

    $.mobile.navigate("#tutorial", {
      transition: "pop",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial2').on('swipeleft', function(event) {

    $.mobile.navigate("#tutorial3", {
      transition: "slide",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial2').on('swiperight', function(event) {

    $.mobile.navigate("#tutorial1", {
      transition: "pop",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial3').on('swiperight', function(event) {

    $.mobile.navigate("#tutorial2", {
      transition: "pop",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial3').on('swipeleft', function(event) {

    $.mobile.navigate("#tutorial4", {
      transition: "slide",
      info: "info about the #foo hash"
    });

  });

  $('#tutorial4').on('swiperight', function(event) {

    $.mobile.navigate("#tutorial3", {
      transition: "pop",
      info: "info about the #foo hash"
    });

  });
  //;
  $('#loginForm').submit(function(e) {
    e.preventDefault();
    html = $(this).jqmData("html") || "";
    var form = new FormData($("#loginForm")[0]);
    $.mobile.loading("show", {
      text: "Verificando",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    login();
    //form.append("regID",localStorage.getItem('registrationId'));

  });
  //busqueda de correo para recuperación de contraseña
  $('#recupForm').submit(function(e) {
    e.preventDefault();
    html = $(this).jqmData("html") || "";
    var form = new FormData($("#loginForm")[0]);
    $.mobile.loading("show", {
      text: "Verificando",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    recup();
  });
  //datos para actualización de contraseña al ser recuperada
  $('#contraForm').submit(function(e) {
    e.preventDefault();
    html = $(this).jqmData("html") || "";
    var form = new FormData($("#loginForm")[0]);
    $.mobile.loading("show", {
      text: "Verificando",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    nuevac();
  });

  $('#repForm').submit(function(e) {
    e.preventDefault();
    if ($("#timePs").val() != "") {
      var check = $("#timePs").val();
      var cita = $("#dateId").val();
      var doct = $("#doctMail").text();

      $.ajax({
        url: "https://www.icone-solutions.com/doct/sqlOP.php",
        type: "POST",
        data: {
          checkds: check,
          docd: doct,
          appointment: cita

        },
        success: function(data) {
          data = JSON.parse(data);

          if (data.success) {
            reSchedule(data.appointment.id);
          } else {
            swal("Error", data.toString(), "error");
          }

        },
        error: function() {

          swal("Error", "Revisa tu conexión de internet.", "error");
        }
      })

    } else {
      swal("Elige una fecha para continuar", "", "info");
    }


  });

  $('#repdForm').submit(function(e) {
    e.preventDefault();
    if ($("#timeD").val() != "") {
      var check = $("#timeD").val();
      var cita = $("#datedId").val();
      var doct = JSON.parse(localStorage.getItem("user")).mail;

      $.ajax({
        url: "https://www.icone-solutions.com/doct/sqlOP.php",
        type: "POST",
        data: {
          checkds: check,
          docd: doct,
          appointment: cita

        },
        success: function(data) {
          data = JSON.parse(data);

          if (data.success) {
            reScheduled(data.appointment.id);
          } else {
            swal("Error", data.toString(), "error");
          }

        },
        error: function() {

          swal("Error", "Revisa tu conexión de internet.", "error");
        }
      })

    } else {
      swal("Elige una fecha para continuar", "", "info");
    }


  });


  $("#payForm").submit(function(e) {
    e.preventDefault();

    swal({
        title: "¿Estás seguro que tus datos son correctos?",
        text: "",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Aceptar",
        showLoaderOnConfirm: true,
        closeOnConfirm: false,
        cancelButtonText: "Cancelar",
      },
      function(isConfirm) {
        if (isConfirm) {
          if ($('#cPay').is(":visible")) {
            var exd = $("#expdate").val().split("/");
            var month = exd[0];
            var year = exd[1];
            $("#month").val(month);
            $("#year").val(year);
            checkC();
          } else {
            paynt();
          }
        }
      });
  });


  $("#CIP").click(function() {
    $("#fotoP").click();
  });
  $("#CID").click(function() {
    $("#fotoD").click();
  });
  $("#elabi").click(function() {
    $("#elab").click();
  });
  $("#radioi").click(function() {
    $("#radiograf").click();
  });
  $("#recei").click(function() {
    $("#recetaf").click();
  });
  $("#fotoP").change(function() {
    readURL(this);
  });
  $("#fotoD").change(function() {
    readURL(this);
  });

  $("#regForm").submit(function(e) {
    e.preventDefault();
    var empty = $(this).find("input").filter(function() {

      return this.value === "";

    });
    if (empty.length == 0) {
      if ($("#pass1").val() == $("#pass2").val()) {
        swal({
            title: "¿Estás seguro que tus datos son correctos?",
            text: "",
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Aceptar",
            showLoaderOnConfirm: true,
            closeOnConfirm: false,
            cancelButtonText: "Cancelar",
          },
          function(isConfirm) {
            if (isConfirm) {
              register("#regForm");
            }
          });
      } else {
        swal("Error", "Las contraseñas no coinciden", "error");
      }
    } else {
      swal("Error", "Debes completar todos los campos", "error");
    }
  });

  //validaciones
  function validae() {
    if ($('#espD').val() == "") {
      swal("Error", "El campo especialidad no puede estar vacío.", "error");
    } else if ($('#uniD').val() == "") {
      swal("Error", "El campo universidad no puede estar vacío.", "error");
    } else if ($('#cedD').val() == "") {
      swal("Error", "El campo cédula no puede estar vacío", "error");
    } else {
      return true;
    }
  }

  function validaP() {
    if ($('#nombreU').val() == '') {
      swal("Error", "El nombre no puede estar vacío.", "error");
    } else if ($('#mailU').val() == '') {
      swal("Error", "El correo no puede estar vacío.", "error");
    } else if ($('#telU').val() == '') {
      swal("Error", "El telefono no puede estar vacío.", "error");
    } else {
      return true;
    }
  }

  function validac() {
    if ($('#nombreD').val() == "") {
      swal("Error", "El nombre no puede estar vacío.", "error");
    } else if ($('#mailD').val() == "") {
      swal("Error", "El correo no puede estar vacío.", "error");
    } else if ($('#telD').val() == "") {
      swal("Error", "El teléfono no puede estar vacío", "error");
    } else {
      return true;
    }
  }

  $("#datosForm").submit(function(e) {
    e.preventDefault();
    if (validaP()) {
      swal({
          title: "¿Estás seguro que tus datos son correctos?",
          text: "",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Aceptar",
          showLoaderOnConfirm: true,
          closeOnConfirm: false,
          cancelButtonText: "Cancelar",
        },
        function(isConfirm) {
          if (isConfirm) {
            updateD();
          }
        });
    }

  });

  $("#datosdForm").submit(function(e) {
    e.preventDefault();
    if (validac()) {
      swal({
          title: "¿Estás seguro que tus datos son correctos?",
          text: "",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Aceptar",
          showLoaderOnConfirm: true,
          closeOnConfirm: false,
          cancelButtonText: "Cancelar",
        },
        function(isConfirm) {
          if (isConfirm) {
            updateDD();
          }
        });
    }

  });
  $("#closesLV").click(function(e){
     $('.closesLV').prop('disabled', function(i, v) { return !v; });
  });
  $("#closesS").click(function(e){
     $('.closesS').prop('disabled', function(i, v) { return !v; });
  });
  $("#closesD").click(function(e){
     $('.closesD').prop('disabled', function(i, v) { return !v; });
  });
  $("#datosConsul").submit(function(e) {
    e.preventDefault();
    var flag=true;
    $('#datosConsul input[type!=submit]').each(function(){
       //If the field's empty
       if($(this).val() == '' && $(this).is(':enabled'))
       {

          flag=false;

          return false;
       }
    });
    if(flag){
      swal({
          title: "¿Estás seguro que tus datos son correctos?",
          text: "",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Aceptar",
          showLoaderOnConfirm: true,
          closeOnConfirm: false,
          cancelButtonText: "Cancelar",
        },
        function(isConfirm) {
          if (isConfirm) {
            updateCD();
          }
        });
    }else{
      swal("Error", "Debes completar todos los campos", "error");
    }

  });

  $("#datoseForm").submit(function(e) {
    e.preventDefault();
    if (validae()) {
      swal({
          title: "¿Estás seguro que tus datos son correctos?",
          text: "",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Aceptar",
          showLoaderOnConfirm: true,
          closeOnConfirm: false,
          cancelButtonText: "Cancelar",
        },
        function(isConfirm) {
          if (isConfirm) {
            updateDE();
          }
        });
    }

  });

  $(".cancelAp").click(function(e) {
    swal({
        title: "¿Estás seguro que deseas cancelar tu cita?",
        text: "",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Aceptar",
        showLoaderOnConfirm: true,
        closeOnConfirm: false,
        cancelButtonText: "Cancelar",
      },
      function(isConfirm) {
        if (isConfirm) {
          cancelC(citap);
        }
      });
  });

  var datosp = Array();

  $("#edit").click(function() {
    if ($(this).hasClass("ui-icon-edit")) {
      $(this).removeClass("ui-icon-edit");
      $(this).addClass("ui-icon-delete");
      $('#accForm input[type=text],#accForm textarea').css("background-color", "#fff");
      $('#accForm input[type=text],#accForm textarea').prop('readonly', false);
      $('#joba').selectmenu('enable');
      $("#saveD").css("visibility", "visible");
    } else {
      $(this).addClass("ui-icon-edit");
      $(this).removeClass("ui-icon-delete");
      $('#accForm input[type=text],#accForm textarea').css("background-color", "transparent");
      $('#accForm input[type=text],#accForm textarea').prop('readonly', true);
      $('#joba').selectmenu('disable');

      $("#nombrea").val(datosp[1]);
      $("#compa").val(datosp[2]);
      $("#addressa").val(datosp[3]);
      $("#statea").val(datosp[4]);
      $("#citya").val(datosp[5]);
      $("#paisa").val(datosp[6]);
      $("#telefonoa").val(datosp[8]);
      $("#cellpa").val(datosp[9]);
      $("#joba").val(datosp[10]);
      $("#saveD").css("visibility", "hidden");
    }
    $('#joba').selectmenu('refresh', true);

  });




  $(".close").click(function() {
    localStorage.clear();
    $.mobile.navigate("#inicio", {
      transition: "pop",
      info: "info about the #foo hash"
    });
  });

  var thisMonth = moment().format('YYYY-MM');




  var saturday;
  var weekend;
  var sunday;
  var allowed;
  var disabledt;
  var todaytp;
  $("#doctUl, #map_canvas").on("click", ".showD", function(e) {
    e.preventDefault();
    var d = $(this).data("doct");
    html = $(this).jqmData("html") || "";
    $.mobile.loading("show", {
      text: "Cargando Info",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    var idug = JSON.parse(localStorage.getItem("user")).id;
    $.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "POST",
      data: {
        doctor: d,
        idug: idug
      },
      success: function(data) {
        console.log(data);
        var docts = jQuery.parseJSON(data);
        $("#doctP").val(docts[0][0]);
        $("#imgd").css("background-image", "url('https://www.icone-solutions.com/doct/img/" + docts[0][4] + "')");
        $("#a-imgd").css("background-image", "url('https://www.icone-solutions.com/doct/img/" + docts[0][4] + "')");
        $("#sdname").text(docts[0][1]);
        $("#a-sdname").text(docts[0][1]);
        $("#spec").text(docts[0][2]);
        $("#a-spec").text(docts[0][2]);
        $("#a-price").text("Consulta: $" + docts[0][3]);
        $("#p-price").text("$" + docts[0][3]);
        $("#totsf").val(parseFloat(docts[0][3]));
        $("#location").text(docts[0][5]);
        $("#lv,#sat,#dom").empty();
        $("#lv").append("Lun-Vie " + docts[0][6]);
        $("#sat").append("Sábados " + docts[0][7]);
        $("#dom").append("Domingos " + docts[0][8]);
        $("#cedula").text(docts[0][15]);
        $("#uni").text(docts[0][14]);
        $("#totU").text(docts[0][13]);
        var i;
        var c = docts[0][16].length;
        var d = docts[0][16];
        //console.log(c);
        $("#experiencia").empty();
        for (i = 0; i < c; i++) {
          $('#experienciad').append('<div ><p>' + d[i] + '</p></div>');
        }
        weekend = docts[0][9];
        saturday = docts[0][10];
        sunday = docts[0][11];
        allowed = docts[0][12];
        var d = new Date();
        var dd = d.getDate();
        var mm = d.getMonth() + 1; //January is 0!

        var yyyy = d.getFullYear();
        if (dd < 10) {
          dd = '0' + dd;
        }
        if (mm < 10) {
          mm = '0' + mm;
        }

        todaytp = yyyy + '-' + mm + '-' + dd;
        if (allowed.length == 0) {

          disabledt = [todaytp];
          dd = '0' + (d.getDate() + 1);
          todaytp = yyyy + '-' + mm + '-' + dd;

        } else {
          disabledt = [];
        }
        $.mobile.loading("hide");

        $.mobile.navigate("#doctor_show", {
          transition: "slidedown"
        });
      }
    });
  });
  $("#listg").click(function(e) {
    e.preventDefault();
    html = $(this).jqmData("html") || "";
    $.mobile.loading("show", {
      text: "Cargando Lista",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    $.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "POST",
      data: {
        doctors: 1
      },
      success: function(data) {
        $("#doctUl").empty();
        var docts = jQuery.parseJSON(data);
        for (var i = 0; i < docts.length; i++) {
          $("#doctUl").append(' <li><a class="showD" data-doct="' + docts[i][4] + '">' +
            '<img src="https://www.icone-solutions.com/doc/img/' + docts[i][3] + '" />' +
            '<span class="dname">' + docts[i][0] + '</span>' +
            '<span class="scp">' + docts[i][1] + '</span>' +
            '<span class="scp">Consulta: $' + docts[i][2] + '</span>' +
            '</a>' +
            '</li>')
        }
        if ($("#doctUl").hasClass('ui-listview')) {
          $("#doctUl").listview('refresh');
        }
        $.mobile.loading("hide");

        $.mobile.navigate("#doctor_list", {
          transition: "slide"
        });
      }
    });
  });

  //$('.showP').click(function(e) {
  $("#pacUl").on("click", ".showP", function(e) {
    //$(".showP").on("click", function(e){
    e.preventDefault();
    console.log("voy");
    var p = $(this).data("pac");
    console.log(p);
    //html = $(this).jqmData( "html" ) || "";
    $.mobile.loading("show", {
      text: "Cargando Info",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    $.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "POST",
      data: {
        etneicap: p
      },
      success: function(data) {
        console.log(data);
        var docts = jQuery.parseJSON(data);
        //$("#doctP").val(docts[0][0]);
        $("#imgp").css("background-image", "url('https://www.icone-solutions.com/doct/img/" + docts[0][14] + "')");
        //$("#a-imgp").css("background-image", "url('http://www.icone-solutions.com/doct/img/"+docts[0][4]+"')");
        $("#spname").text(docts[0][0]);
        $("#psex").text(docts[0][2]);
        $("#estadoc").text("Estado civil: " + docts[0][4]);
        $("#pedad").text("Edad: " + docts[0][5]);
        $("#ptelef").text("Teléfono: " + docts[0][6]);
        $("#pdir").text("Dirección: " + docts[0][7] + ", " + docts[0][11] + ", " + docts[0][8] + ", " + docts[0][9] + ", " + docts[0][10] + ", " + docts[0][13]);
        $("#pahfs").text("Antecedentes heredo familiares: " + docts[0][16]);
        $("#phns").text("Hábitos no saludables: " + docts[0][17]);
        $.mobile.loading("hide");
        $.mobile.navigate("#paciente_show", {
          transition: "slidedown"
        });
      }
    });
  });
  $('#np').click(function(e) {
    e.preventDefault();
    html = $(this).jqmData("html") || "";
    $.mobile.loading("show", {
      text: "Verificando",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });

    if ($("#default_datetimepicker").val() != "") {

      var check = $("#default_datetimepicker").val();
      var doct = $("#doctP").val();
      $.ajax({
        url: "https://www.icone-solutions.com/doct/sqlOP.php",
        type: "POST",
        data: {
          checkds: check,
          docd: doct
        },
        success: function(data) {
          data = JSON.parse(data);
          $.mobile.loading("hide");
          if (data.success) {
            $.mobile.navigate("#payment", {
              transition: "slidedown"
            });
          } else {
            swal("Ups!", data.appointment.message, "error");
          }
        },
        error: function() {
          $.mobile.loading("hide");
          swal("Error", "Revisa tu conexión de internet.", "error");
        }
      })

    } else {
      swal("Elige una fecha para continuar", "", "info");
    }
  });
  jQuery.datetimepicker.setLocale('es');

  $('#calendar_p').on('pageshow', function(event) {
    /*  var disabled = [];
      var allowedt = [];
      if (weekend[0] == "Cerrado") {
        disabled.push(1);
        disabled.push(2);
        disabled.push(3);
        disabled.push(4);
        disabled.push(5);
      }
      if (saturday[0] == "Cerrado") {
        disabled.push(6);
      }
      if (sunday[0] == "Cerrado") {
        disabled.push(0);
      }

      $('#timePs').datetimepicker({
        formatDate: 'Y-m-d',
        formatTime: 'H:i',
        defaultTime: "9:00",
        disabledWeekDays: disabled,
        allowTimes: allowed,
        minDate: todaytp,
        startDate: todaytp,
        onSelectDate: function(ct, $i) {

          var d = new Date(ct);
          html = $(this).jqmData("html") || "";
          $.mobile.loading("show", {
            text: "Cargando Horarios",
            textVisible: true,
            theme: "b",
            textonly: false,
            html: html
          });
          var now = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
          $.ajax({
            url: "https://www.icone-solutions.com/doct/sqlOP.php",
            type: "POST",
            data: {
              sdate: now,
              cd: 1
            },
            success: function(data) {
              console.log("mkakaka");
              $.mobile.loading("hide");
              allowed = jQuery.parseJSON(data);

              $i.datetimepicker('setOptions', {
                allowTimes: allowed
              });

            },
            error: function() {
              swal("Error", "No se ha podido conectar al servidor, revisa tu conexión", "error");
            }
          })


        }
      });*/
  });

  $('#chooseD').on('pageshow', function(event) {
    var disabled = [];
    var allowedt = [];
    if (weekend[0] == "Cerrado") {
      disabled.push(1);
      disabled.push(2);
      disabled.push(3);
      disabled.push(4);
      disabled.push(5);
    }
    if (saturday[0] == "Cerrado") {
      disabled.push(6);
    }
    if (sunday[0] == "Cerrado") {
      disabled.push(0);
    }
    $('#default_datetimepicker').datetimepicker({
      formatDate: 'Y-m-d',
      formatTime: 'H:i',
      defaultTime: "9:00",
      disabledWeekDays: disabled,
      allowTimes: allowed,
      minDate: todaytp,
      startDate: todaytp,
      onSelectDate: function(ct, $i) {
        var d = new Date(ct);
        html = $(this).jqmData("html") || "";
        $.mobile.loading("show", {
          text: "Cargando Horarios",
          textVisible: true,
          theme: "b",
          textonly: false,
          html: html
        });
        var now = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        $.ajax({
          url: "https://www.icone-solutions.com/doct/sqlOP.php",
          type: "POST",
          data: {
            sdate: now,
            cd: 1
          },
          success: function(data) {
            $.mobile.loading("hide");
            allowed = jQuery.parseJSON(data);

            $i.datetimepicker('setOptions', {
              allowTimes: allowed
            });

          },
          error: function() {
            swal("Error", "No se ha podido conectar al servidor, revisa tu conexión", "error");
          }
        })


      }
    });
  });




  $('input[name="mpay"]').click(function() {
    if ($(this).val() == "t") {
      $("#cPay").show();
    } else {
      $("#cPay").hide();
    }
  });

  $(function() {

    $("#card").inputmask("9999 9999 9999 9999", {
      "placeholder": "0000 0000 0000 0000"
    });
    $("#cvv").inputmask("999", {
      "placeholder": "000"
    });
    $("#expdate").inputmask("99/9999", {
      "placeholder": "mm/aaaa"
    });


  });

});
