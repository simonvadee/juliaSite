$(document).ready(function() {

  $(".category_name").click(function () {
    console.log($(this))
    classList = $(this).context.className.split(" ")
    console.log(classList)
    if (classList.indexOf("active") >= 0)
      $(this).removeClass("active");
    else {
      $(".category_name").removeClass("active")
      $(this).addClass("active");
    }
  });


});