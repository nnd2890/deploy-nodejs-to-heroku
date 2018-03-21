
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