
// =======================================================
// Slide show
var slideIndex = 1;
showSlides(slideIndex);

// Thumbnail image controls
function currentSlide(n){
  slideIndex = n;
  showSlides(n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace("active", "");
  }
  slides[slideIndex-1].style.display = 'block';
  dots[slideIndex-1].className += " active";
}


// =======================================================
// Dropdown
function myFunction() {
  document.getElementById("myDropdown").classList.toggle('show');
  console.log('click');
}

window.onclick = function(event) {
  if (!event.target.matches('.drop-click')) {
    var dropdowns = document.getElementsByClassName('dropdown-content');
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

$(document).ready(function() {
  alert(1);
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
});