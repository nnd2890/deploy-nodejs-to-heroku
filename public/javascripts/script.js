$(document).ready(function() {
  $( ".delete-article" ).on( "click", function(e) {
    if(confirm("Are you sure you want to delete this?")){
      $target = $(e.target);
      const id = $target.attr('data-id');
      const csrfToken = $( "#_csrf" ).val();
      $.ajax({
        type: 'DELETE',
        url: '/article/'+id,
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