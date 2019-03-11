$(document).ready(function() {

  $('.nameval').on('keyup', function (event) {
  	
      var regex = new RegExp("^[ñÑá-úÁ-Ú.a-zA-Z ]+$");
      
      if (!regex.test($(this).val())) {
      	$(this).val("");
         event.preventDefault();
         return false;
      }
  });
  $('.numval').on('keyup', function (event) {
  	
      var regex = new RegExp("^[0-9]+$");
      
      if (!regex.test($(this).val())) {
      	$(this).val("");
         event.preventDefault();
         return false;
      }
  });

});
