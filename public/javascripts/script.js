$(document).ready(function(){
    $('.deleteProduct').on('click', function(e){
      $target = $(e.target);
      var id = $target.attr('data-id');
      $.ajax({
        type:'DELETE',
        url:'http://localhost:3000/products/'+id,
        xhrFields: {
            withCredentials: true
       },
        success: function(response) {
            alert('Deleting product...');
            window.location.href = '/';
        },
        error: function(err) {
            console.log(err);
        }
      });
    });
});