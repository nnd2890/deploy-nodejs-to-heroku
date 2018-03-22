$(document).ready(function() {
  //  delete Product
  $( ".delete-product" ).on( "click", function(e) {
    if(confirm("Are you sure you want to delete this?")){
      $target = $(e.target);
      const id = $target.attr('data-id');
      const csrfToken = $( "#_csrf" ).val();
      $.ajax({
        type: 'DELETE',
        url: '/delete-product/'+id,
        headers: {
          'CSRF-Token': csrfToken 
        },
        success: function(response) {
          location.reload();
        },
        error: function(err) {
          console.log(err);
        }
      });
    }
    else{
        return false;
    }
  });


  // Change status for order
  $( ".status-order" ).on( "change", function(e) {
    if(confirm("Are you sure you want to change the status of order?")){
      $target = $(e.target);
      const id = $target.attr('data-id');
      const status = $target.val();
      const csrfToken = $( "#_csrf" ).val();
      $.ajax({
        type: 'POST',
        url: '/admins/order-status/'+id,
        data: {status: status},
        headers: {
          'CSRF-Token': csrfToken 
        },
        success: function(response) {
          location.reload();
        },
        error: function(err) {
          console.log(err);
        }
      });
    }
    else{
        return false;
    }
  });
});