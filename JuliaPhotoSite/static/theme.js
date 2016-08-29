
var Listing = {
  init : function(){

    var maxHeight = 0;
    var width = $('.listing .gallery .image').width();

    function setLiHeight() {
      maxHeight = 0;
      width = $('.listing .gallery .image').width();
      var imageHeight = width / 1.3;
      $('.listing .gallery .image').attr('style', '')
        .each(function() {
          $(this).closest('li')
            .find('.image_box')
            .height(imageHeight)
            .find('img')
            .css({'margin-top': -(width - imageHeight) / 2});
          maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
        });
      $('.listing .gallery .image').css('height', maxHeight + 'px');
    }

    $(window).on('resize', setLiHeight);
    
    _4ORMAT.Lazyload.add('.image img', {
      slideshow: true,
      complete: function(img){
        var imageHeight = width / 1.3;
        img.closest('li')
          .find('.image_box')
          .height(imageHeight)
          .find('img')
          .css({'margin-top': -(width - imageHeight) / 2})
        $('.listing .gallery .image').attr('style', '');
        maxHeight = Math.max(maxHeight, img.closest('li').outerHeight(true));
        $('.listing .gallery .image').css('height', maxHeight + 'px');
        img.closest('li').find('.image_box').animate({ opacity: 1 });
      }
    });

    _4ORMAT.Lazyload.init();
  }
};

var Gallery = {
  index_of_last_clicked: 0,
  animating: false,
  gallery_top_margin: $('.js_max_height_target').length > 0 ? $('.js_max_height_target').offset().top : null,
  $caption: $('#caption-content'),

  // get max height of an item, subtracting any margins and space taken
  // up by caption
  maxItemHeight: function() {
    if ( $(window).width() > 840 ) {
      return $(window).height() - this.gallery_top_margin - 80;
    } else {
      // For mobile:
      // simply take window height and make sure an image/video will always fit
      return $(window).height() - 50;
    }
  },

  init: function(){
    var gallery_assets = $('.assets_container');
    if (gallery_assets) {
      this.init_gallery_page(gallery_assets);
    }
    
    // disable dragging of images
    $('body').delegate('img', 'dragstart', function() { return false; });
    _4ORMAT.Lazyload.add('.assets_container img', {
      slideshow: true,
      complete: function(image){
        image.removeClass('loading');
        $(window).trigger('resize');
      }
    });
    _4ORMAT.Lazyload.add('.pagination img', {
      priority: 1,
      complete: function(image) {
        setTimeout(function(){
          image.parent().removeClass('fixed_width');
          image.removeClass('loading');

          Gallery.setThumbPosition();
         }, 0);
      }
    });
    
    _4ORMAT.Lazyload.init();
  },
  
  last_clicked: null,

  init_gallery_page: function(assets) {

    if (assets.length) {
      // select the start image if requested in the URL
      // slides.js has a start: attribute but it doesn't seem to work
      // properly (any index other than 1 doesn't show the image initially)
      var index_requested = 0;
      if (location.hash.match(/^#[0-9]+/)) {
        index_requested = location.hash.slice(1) - 1;
      }

      var start = parseInt(index_requested || 0, 10);

      if( _4ORMAT_DATA.theme.gallery_change_image_speed == 'Slow') {
        var speed = 800;

      } 
      else if( _4ORMAT_DATA.theme.gallery_change_image_speed == 'Normal') {
        var speed = 400;
      } 
      else if( _4ORMAT_DATA.theme.gallery_change_image_speed == 'Fast') {
        var speed = 200;
      } else {
        var speed = 400;
      }

      var transition_effect = _4ORMAT_DATA.theme.transition_effect.toLowerCase();
      switch(transition_effect) {
        case 'slide':
          transition_effect = 'slide';
          break;
        case 'fade':
          transition_effect = 'fade';
          break;
        default:
          transition_effect = 'slide';
      }

      var assets = _4ORMAT_DATA.page.assets,
        size = assets.length,
        isVideo = false;
      
      for (var i = 0; i < size; i += 1) {
        if (assets[i].type === 'video') {
          isVideo = true;
          break;
        }
      }

      $('#total').text($('.flexslider .asset').length);
      $('#current').text(start + 1);

      var $captionContent = $('#caption-content');

      var slider = Gallery.slider = $('.flexslider').flexslider({
        smoothHeight: true,
        controlNav: false,
        animation: transition_effect,
        animationSpeed: speed,
        easing: "easeOutQuad",
        startAt: start,
        slideshow: false,
        animationLoop: true,
        keyboard: false,
        video: isVideo,
        useCSS: !isVideo,
        start: function () {
          Gallery.index_of_last_clicked = start;

          Gallery.set_url_index(start);
    
          $('.asset').on('click', function(e){
            var $target = $(e.target);
            if (!$target.hasClass('bg') &&
              !$target.hasClass('button') &&
              !$target.hasClass('dont-move') &&
              !$target.hasClass('txt') &&
              !$target.parents('.txt').length &&
              !$target.parents('.title').length &&
              !$target.hasClass('title')) {
                var next = $('.pagination .thumb_item.active').next().length ?
                  $('.pagination .thumb_item.active').next() : $('.pagination .thumb_item:first');
                next.find('a').trigger('click', [false]);
            }
          });

          var $pagination = $('.pagination'),
              $nav = $('#assets > h4'),
              isPaginationOpened = false;

          $('.open-close-thumbs').on('click', function(e, triggerThumbs){
            e.preventDefault();
            triggerThumbs = typeof triggerThumbs === 'undefined' ? true : triggerThumbs;

            var left = parseInt($pagination.css('left'), 10),
                top = $('.flexslider').position().top;

            if (triggerThumbs) {
              if (left === 0 && !$pagination.is(':animated')) {
                $pagination.stop(true, true).animate({opacity: 0}, 600, function(){
                  $pagination.css({ 'left': '-100%', 'top' : '-9000em'});
                });
                $nav.find('.title').hide().end().find('.nav').show();
                $(this).removeClass('icon-close').addClass('icon-grid');
                isPaginationOpened = !isPaginationOpened;
              } else if (!$pagination.is(':animated')) {
                $pagination.css({ 'left': 0, 'top' : top }).stop(true, true).animate({opacity: 1}, 600);
                $nav.find('.nav').hide().end().find('.title').html(_4ORMAT_DATA.page.name).show();
                $(this).removeClass('icon-grid').addClass('icon-close');
                isPaginationOpened = !isPaginationOpened;
              }

              $('iframe').remove();
            }
          });

          $('.thumb_container').on('click', 'a', function(e, triggerThumbs){
              e.preventDefault();

              triggerThumbs = typeof triggerThumbs === 'undefined' ? true : triggerThumbs;

              var $li = $(this).parent();
              $('.thumb_container .active').removeClass('active');
              $li.addClass('active');

              var index = $li.index();
  
              Gallery.index_of_last_clicked = index;
              
              if (slider) {
                slider.flexslider(index);
              }

              $('.open-close-thumbs').trigger('click', [triggerThumbs]);
          });

          var slide = {
            next: function(e){
              e.preventDefault();
              if ($('.assets_container ').is(':animated')) return;

              var next = $('.pagination .active').next().length ? 
                $('.pagination .active').next() :
                $('.pagination .thumb_item').first();

              next.find('a').trigger('click', [false]);
            },
            prev: function (e){
              e.preventDefault();
              if ($('.assets_container ').is(':animated')) return;
              
              var prev = $('.pagination .active').prev().length ? 
                $('.pagination .active').prev() :
                $('.pagination .thumb_item').last();

              prev.find('a').trigger('click', [false]);
            }
          }

          $(document).on('keydown', function(e){
            if (Gallery.animating) return;

            if (e.which == '39' && !isPaginationOpened) { //next
              slide.next(e);
            }

            if (e.which == '37' && !isPaginationOpened) { //prev
              slide.prev(e);
            }

            if (e.which == '27' && $('.pagination').css('opacity') == '1') {
              e.preventDefault();
              $('.open-close-thumbs').trigger('click');
            }
          });

          $('.next').on('click', slide.next);
          $('.prev').on('click', slide.prev);

          $('.thumb_container .thumb_item').eq(start).find('a').trigger('click', [false]);

          $(window).on('resize', function(){
            if ($('.asset').length == 1) {
              $('.asset').width($('.flexslider').width());
            }
          }).trigger('resize');

          $('.load_iframe').addClass('icon-video').parent().append('<div class="layer"></div>');

          $captionContent
            .html($('.flex-active-slide')
              .not('.title')
              .find('.caption')
              .html())
            .fadeIn(speed);
          
          setTimeout(function(){
            $(window).trigger('resize');
          }, 700);

          if ($('.asset').not('.clone').length == 1) {
            $('.assets_container .image span > img').css('cursor', 'default');
          }

          if ($.browser.msie && $.browser.version == '8.0' && transition_effect === 'fade') {
            $('.asset').hide();
            $('.flex-active-slide').show();
            $('.pagination').css('opacity', 0);
          }

          $('img[nopin=""]').attr('nopin', 'true');
          $('.flex-active-slide').find('img').attr('nopin', '');
        },
        before: function (slider) {
          // set class for item thats previous. This is so we dont display:none right away, before transition is done
          $(slider.slides[slider.currentSlide]).addClass('js_slider_previous');

          Gallery.animating = true;
          var index = Gallery.index_of_last_clicked;

          Gallery.set_url_index(index);

          $('iframe').remove();

          $captionContent
            .stop()
            .fadeOut(speed)
            .html('');

          if ($.browser.msie && $.browser.version == '8.0' && transition_effect === 'fade') {
            setTimeout(function(){
              $('.asset').hide();
              $('.flex-active-slide').show();
            }, transition_effect);
          }

          Gallery.setVideoDimension(slider.slides[slider.animatingTo]);
        },
        after: function (slider) {
          // remove previous slide class
          $('.js_slider_previous').removeClass('js_slider_previous');

          Gallery.animating = false;

          if (_4ORMAT_DATA.theme.transition_effect == 'Fade' && $(slider.slides[slider.currentSlide]).find('img').length) {
            $('.flexslider').stop(true, true).animate({ height: $(slider.slides[slider.currentSlide]).find('img').height() });
          }

          $('#current').text(slider.currentSlide + 1);

          $captionContent
            .html($('.flex-active-slide')
            .not('.title')
            .find('.caption')
            .html())
            .stop()
            .fadeIn(speed);

          $('img[nopin=""]').attr('nopin', 'true');
          $('.flex-active-slide').find('img').attr('nopin', '');
        }
      });
      
      //resize window
      $(window).on('resize', function(){
        Gallery.setThumbPosition();
        Gallery.setVideoDimension();
      });

    }
  },

  set_url_index: function(index) {
    location.hash = "#" + (index + 1);
  },

  setThumbPosition: function(){
    var eleWidth = Math.floor($('.pagination .thumb_item').width());
    $('.thumb_item, .video img', '.pagination').height(eleWidth);

    $('.video img', '.pagination').each(function(){
      var $self = $(this),
          vWidth = $self.width();

      $self.css('margin-left', -(vWidth - eleWidth)/2);
    });
    
    if (_4ORMAT_DATA.theme.thumbnails_shape === 'Original') {
      $('.thumb_item.image img', '.pagination').css('max-height', eleWidth);
    }
  },
  setVideoDimension: function(el){
    var $video = el ? $(el).find('.video span') : $('.asset.video.flex-active-slide span');
    if ( $video.length == 0 ) return false; // skip if current asset is not video

    var max_height = Gallery.maxItemHeight(),
        ratio = Number( $video.parent().attr('data-video-ratio') ),
        height = $(Gallery.slider).width() / ratio;

    if (height < max_height) {
      $video.css({
        width: '100%',
        height: Math.ceil(height)
      });
    } else {
      // Video doesnt fit in height.
      // Probably means its protrait or square. 
      // Lets cap height and adjust width instead.
      $video.css({
        height: max_height,
        width: max_height * ratio
      });
    }
  }
};

$(document).ready(function(){
  if(_4ORMAT_DATA.page.type === 'gallery') {
    Gallery.init();
  }
  if(_4ORMAT_DATA.page.type === 'listing') {
    Listing.init();
  }

  var $categories = $('.category_name');
  var categoryHandler = function(e) {
    e.preventDefault();


    $categories.not($(this)).removeClass('active');
    $(this).toggleClass('active');
  };

  $categories.on('click', categoryHandler);

  if ($('#menu .active').not('.category_name').length) {
    $('#menu .active').closest('.category').find('.category_name').trigger('click');
  }
  
  function menuLinks(){
    var isHorizontal = $('#menu .top_level').css('float') === 'left';
    if (isHorizontal) {
      if (($('.category_name').data('events'))) {
        $('.category_name').off('click').removeClass('active');
        $('.dropdown').attr('style', '');
        $('#menu').toggleClass('hor');
      }
    } else {
      if (!($('.category_name').data('events'))) {
        $('.category_name').on('click', categoryHandler);
        $('#menu').toggleClass('hor');
      }
    }
  }

  function menuPosition(){
    var $logo = $('.menu-logo'),
        top = 0;
   
    top = parseInt($logo.css('top')) + $logo.height() + 30;
    $('#menu_wrap').css('top', top);
  }

  menuLinks();
  $(window).load(function() {
    menuPosition();
  });
  $(window).on('resize', function(){
    menuLinks();
    menuPosition();
  });

  $('#menu .item .active').prev().addClass('active');
});