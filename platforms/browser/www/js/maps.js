var lato=23.634501;
var longo=-102.55278399999997;

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

var onSuccess = function(position) {

  lato = parseFloat(position.coords.latitude) ;
  longo = parseFloat(position.coords.latitude) ;
  if(lato == 0 || longo ==0){
    lato= 40.7127837;
    longo=-74.00594130000002;
  }
};

// onError Callback receives a PositionError object
//
function onError(error) {
  lato= 23.634501;
  longo=-102.55278399999997;
  //swal("Error","Revisa tu conexión a internet para tener acceso a todas las funciones","error");
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

var map = new GMaps({
  div: '#map_canvas',
  width: '100%',
  height: '400px',
  lat: lato,
  lng: longo,
  zoom:16
});

$(document).ready(function(){

  $( '#map_search' ).on( 'beforepageshow',function(event){
    map.refresh();
  });

  GMaps.geolocate({
    success: function(position){

      map.setCenter(position.coords.latitude, position.coords.longitude);
    },
    error: function(error){
      //alert('Geolocation fallo: '+error.message);
    },
    not_supported: function(){
    // alert("Tu equipo no soporta esta función");
    },
    always: function(){

    }
  });

  $('#geocoding_form').submit(function(e){
    e.preventDefault();
    map.removeMarkers();
    html = $(this).jqmData( "html" ) || "";
    $.mobile.loading( "show", {
      text: "Cargando...",
      textVisible: true,
      theme: "b",
      textonly: false,
      html: html
    });
    var addr = $('#address').val().trim();

    $.ajax({
      url: "https://www.icone-solutions.com/doct/sqlOP.php",
      type: "post",
      data:{ search:addr },
      success: function(data){

        var icon;
        var locations = new Array();
        var doctors= jQuery.parseJSON(data);

         doctors.forEach(function(doctor){

         doctor.offices.forEach(function(office){
             icon={
               url: "https://www.icone-solutions.com/doct/img/"+doctor.photo, // url
               //url: 'https://icone-solutions.com/doct/img/1.png',
               scaledSize: new google.maps.Size(70, 70), // scaled size
               origin: new google.maps.Point(0,0), // origin
               anchor: new google.maps.Point(0, 0) // anchor
             };
             console.log(office);
             var content = '<center><h2>Dr.'+doctor.name+'</h2><h3>'+doctor.specialty+'</h3></center><p style="color: black;">' + office.address + '</p><center><a  class="showD" data-doct="' + doctor.doctor + '" data-transition="slide">Ver más</a ></center>';

             GMaps.geocode({
               address: office.address,
               callback: function(results, status){
                   console.log(results);
                 if(status=='OK'){
                   var latlng = results[0].geometry.location;
                   map.setCenter(latlng.lat(), latlng.lng());
                   map.addMarker({
                     lat: latlng.lat(),
                     lng: latlng.lng(),
                     /*click: function(e){

                     }*/
                     icon: icon,
                     infoWindow: {
                       content: content
                     }
                     /*icon: icon,
                     infoWindow: {
                       content: '<p style="color: black;">'+doctors[i][1]+'</p><br><a  class="showD" data-doct="'+doctors2+'" data-transition="slide">Ver más</a >'
                     }*/
                   });
                 }
               }
             });
         });



        });
        $.mobile.loading( "hide");
        map.setZoom(13);
        $("#address").val("");
      }
    });

  });

});
