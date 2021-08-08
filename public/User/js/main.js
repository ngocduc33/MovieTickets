(function ($) {
  "user strict";
  // Preloader Js
  $(window).on("load", function () {
    $(".preloader").fadeOut(1000);
    var img = $(".bg_img");
    img.css("background-image", function () {
      var bg = "url(" + $(this).data("background") + ")";
      return bg;
    });
    // filter functions
    var $grid = $(".grid-area");
    var filterFns = {};
    $grid.isotope({
      itemSelector: ".grid-item",
      masonry: {
        columnWidth: 0,
      },
    });
    // bind filter button click
    $("ul.filter").on("click", "li", function () {
      var filterValue = $(this).attr("data-filter");
      // use filterFn if matches value
      filterValue = filterFns[filterValue] || filterValue;
      $grid.isotope({
        filter: filterValue,
      });
    });
    // change is-checked class on buttons
    $("ul.filter").each(function (i, buttonGroup) {
      var $buttonGroup = $(buttonGroup);
      $buttonGroup.on("click", "li", function () {
        $buttonGroup.find(".active").removeClass("active");
        $(this).addClass("active");
      });
    });
  });
  $(document).ready(function () {
    //prevent form submit
    $('#form_search_ajax').submit(function(e) {
      e.preventDefault(); // stop the submission
    });

    // set timeout alert danger
    $("#alert-danger").fadeTo(3000, 500).slideUp(500, 'swing', function(){
      $("#alert-danger").alert('close');
    });

    // set timeout alert success
    $("#alert-success").fadeTo(3000, 500).slideUp(500, 'swing', function(){
      $("#alert-success").alert('close');
    });

    //when click btn search in home page
    $('#btn_search').on('click', function() {
      $('#seat_plan_wrapper').css('display','block');
    });

    //filter theater cluster when selected movie
    $('select[name=select_movie]').on('change', function() {
      $("select[name=select_theater_cluster]").prop('disabled', false);
      let movie_selected = $(this).val();
      if(movie_selected !== "")
      {
        $.ajax({
          type: "POST",
          url: "/user/movie-ticket-plan/filter-cluster",
          data: {movie_id: movie_selected},
          dataType: "json",
          success: function(res){
              let html = "";
              $.each(res, function(index, val) {
                  html += '<option value="'+ val.cluster_id +'">'+ val.cluster_name+'</option>';
              });
              if(html == "") {
                  //set value default date when theater cluster empty
                  html = '<option value=""></option>';
                  $('select[name=select_date]').html(html);
                  $('select[name=select_theater_cluster]').html(html);
                  $('select[name=select_date]').niceSelect('destroy');
                  $('select[name=select_date]').niceSelect();
                  $('select[name=select_theater_cluster]').niceSelect('destroy');
                  $('select[name=select_theater_cluster]').niceSelect();

                  /*customer windown-warning*/
                  $(".custom-windown-warning").removeClass("inActive");
                  $("div#custom-warning-item h6").text("Thông báo");
                  $("div#custom-warning-item h4").text('Phim bạn chọn tạm thời chưa có suất chiếu. Vui lòng chọn phim khác');
                  /*end customer windown-warning*/
              }
              else
              {
                $('select[name=select_theater_cluster]').html(html);
                $('select[name=select_theater_cluster]').niceSelect('destroy');
                $('select[name=select_theater_cluster]').niceSelect();
              }
          },        
        });
      }
    });

    //filter date when selected movie and theater_cluster
    $('select[name=select_theater_cluster]').on('change', function() {
      $("select[name=select_date]").prop('disabled', false);
      let movie_selected = $("select[name=select_movie] :selected").val();
      let cluster_selected = $(this).val();    
      if(cluster_selected !== "" && movie_selected !== "")
      {
        $.ajax({
          type: "POST",
          url: "/user/movie-ticket-plan/filter-date",
          data: {cluster: cluster_selected, movie: movie_selected},
          dataType: "json",
          success: function(res){
              let html = "";
              $.each(res, function(index, val) {
                  html += '<option value="' + val.schedule_date + '">' + val.schedule_date_frm + '</option>';
              });
              if(html == "") {
                  html = '<option value=""></option>'
                  /*customer windown-warning*/
                  $(".custom-windown-warning").removeClass("inActive");
                  $("div#custom-warning-item h6").text("Thông báo");
                  $("div#custom-warning-item h4").text('Phim bạn chọn tạm thời chưa có suất chiếu. Vui lòng chọn phim khác');
                  /*end customer windown-warning*/
              }
              else
              {
                $('select[name=select_date]').html(html);
                $('select[name=select_date]').niceSelect('destroy');
                $('select[name=select_date]').niceSelect();
              }
          },        
        });
      }
    });

    // ajax when click button search movies
    $('#btn_search_showtimes').on('click', function() {
      $("select[name=select_date]").prop('disabled', false);
      let movie_selected = $("select[name=select_movie] :selected").val();
      let cluster_selected = $("select[name=select_theater_cluster] :selected").val();
      let date_selected = $("select[name=select_date] :selected").val();
      if(movie_selected && cluster_selected && date_selected)
      {
        $.ajax({
          type: "POST",
          url: "/user/movie-ticket-plan/search-showtimes",
          data: {
            select_movie: movie_selected,
            select_cluster: cluster_selected,
            select_date: date_selected
          },
          dataType: "json",
          success: function(res){
            let html = "";
            $('#set_plan_wrapper_ajax').css('display','block');
            $('#seat_plan_wrapper').css('display','none');
            $.each(res, function(index, val) {
                html += '<div class="item"><input type="hidden" value="' + val.id +'"/>' + val.start_time + ' - ' + val.end_time +'</div>';
            });
            if(html === "") {
              $('#set_plan_wrapper_ajax').css('display','none');

              /*customer-windown-warning*/
              $(".custom-windown-warning").removeClass("inActive");
              $("div#custom-warning-item h6").text("Thông báo");
              $("div#custom-warning-item h4").text('Phim bạn chọn tạm thời chưa có suất chiếu. Vui lòng chọn phim khác');
              /*end customer-windown-warning*/
            }
            else 
            {
              $('#movie_search_ajax').text(res[0].movie.name);
              $("#movie_search_ajax").attr("href", `/user/movie-detail/${res[0].movie.id}`);
            }
            $('#movie_schedule_ajax').html(html);
          },        
        });
      }
      else
      {
          /*customer windown-warning*/
          $(".custom-windown-warning").removeClass("inActive");
          $("div#custom-warning-item h6").text("Thông báo");
          $("div#custom-warning-item h4").text('Hãy chọn đầy đủ tất cả thông tin');
          /*end customer windown-warning*/
      }
    });

    // Nice Select
    $(".select-bar").niceSelect();
    // Lightcase
    $(".video-popup").magnificPopup({
      type: "iframe",
    });
    $("body").each(function () {
      $(this)
        .find(".img-pop")
        .magnificPopup({
          type: "image",
          gallery: {
            enabled: true,
          },
        });
    });
    // Wow js active
    new WOW().init();
    //Faq
    $(".faq-wrapper .faq-title").on("click", function (e) {
      var element = $(this).parent(".faq-item");
      if (element.hasClass("open")) {
        element.removeClass("open");
        element.find(".faq-content").removeClass("open");
        element.find(".faq-content").slideUp(300, "swing");
      } else {
        element.addClass("open");
        element.children(".faq-content").slideDown(300, "swing");
        element
          .siblings(".faq-item")
          .children(".faq-content")
          .slideUp(300, "swing");
        element.siblings(".faq-item").removeClass("open");
        element
          .siblings(".faq-item")
          .find(".faq-title, .faq-title-two")
          .removeClass("open");
        element
          .siblings(".faq-item")
          .find(".faq-content")
          .slideUp(300, "swing");
      }
    });

    //MenuBar
    $(".header-bar").on("click", function () {
      $(".menu").toggleClass("active");
      $(".header-bar").toggleClass("active");
      $(".overlay").toggleClass("active");
    });
    $(".overlay").on("click", function () {
      $(".menu").removeClass("active");
      $(".header-bar").removeClass("active");
      $(".overlay").removeClass("active");
    });
    //Menu Dropdown Icon Adding
    $("ul>li>.submenu").parent("li").addClass("menu-item-has-children");
    // drop down menu width overflow problem fix
    $("ul")
      .parent("li")
      .hover(function () {
        var menu = $(this).find("ul");
        var menupos = $(menu).offset();
        if (menupos.left + menu.width() > $(window).width()) {
          var newpos = -$(menu).width();
          menu.css({
            left: newpos,
          });
        }
      });
    $(".menu li a").on("click", function (e) {
      var element = $(this).parent("li");
      if (element.hasClass("open")) {
        element.removeClass("open");
        element.find("li").removeClass("open");
        element.find("ul").slideUp(300, "swing");
      } else {
        element.addClass("open");
        element.children("ul").slideDown(300, "swing");
        element.siblings("li").children("ul").slideUp(300, "swing");
        element.siblings("li").removeClass("open");
        element.siblings("li").find("li").removeClass("open");
        element.siblings("li").find("ul").slideUp(300, "swing");
      }
    });
    // Scroll To Top
    var scrollTop = $(".scrollToTop");
    $(window).on("scroll", function () {
      if ($(this).scrollTop() < 500) {
        scrollTop.removeClass("active");
      } else {
        scrollTop.addClass("active");
      }
    });
    //Click event to scroll to top
    $(".scrollToTop").on("click", function () {
      $("html, body").animate(
        {
          scrollTop: 0,
        },
        500
      );
      return false;
    });
    // Header Sticky Here
    var headerOne = $(".header-section");
    $(window).on("scroll", function () {
      if ($(this).scrollTop() < 1) {
        headerOne.removeClass("header-active");
      } else {
        headerOne.addClass("header-active");
      }
    });
    // windown-warning
    $(".window-warning .lay").on("click", function () {
      $(".window-warning").addClass("inActive");
    });
    $(".window-warning .seatPlanButton").on("click", function () {
      $(".window-warning").addClass("inActive");
    });
    $(".seat-plan-wrapper li .movie-schedule .item").on("click", function () {
      $(".window-warning").removeClass("inActive");
      let showtimeId = $(this).find("input[type=hidden]").val();
      console.log('showtime id : ' + showtimeId);
      $("div#warning-item a[href='/user/movie-seat-plan/']").attr('href', `/user/movie-seat-plan/${showtimeId}`);
    }); 
    $("#set_plan_wrapper_ajax li #movie_schedule_ajax").on("click",".item", function(){
      $(".window-warning").removeClass("inActive");
      let showtimeId = $(this).find("input[type=hidden]").val();
      console.log('showtime id ajax: ' + showtimeId);
      $("div#warning-item a[href='/user/movie-seat-plan/']").attr('href', `/user/movie-seat-plan/${showtimeId}`);
    });
    // custom-windown-warning  
    $(".custom-windown-warning .lay").on("click", function () {
      $(".custom-windown-warning").addClass("inActive");
    });
    $(".custom-windown-warning .continueButton").on("click", function () {
      $(".custom-windown-warning").addClass("inActive");
    });
    //Tab Section
    $(".tab ul.tab-menu li").on("click", function (g) {
      var tab = $(this).closest(".tab"),
        index = $(this).closest("li").index();
      tab.find("li").siblings("li").removeClass("active");
      $(this).closest("li").addClass("active");
      tab
        .find(".tab-area")
        .find("div.tab-item")
        .not("div.tab-item:eq(" + index + ")")
        .fadeOut(500);
      tab
        .find(".tab-area")
        .find("div.tab-item:eq(" + index + ")")
        .fadeIn(500);
      g.preventDefault();
    });
    $(".search-tab ul.tab-menu li").on("click", function (k) {
      var search_tab = $(this).closest(".search-tab"),
        searchIndex = $(this).closest("li").index();
      search_tab.find("li").siblings("li").removeClass("active");
      $(this).closest("li").addClass("active");
      search_tab
        .find(".tab-area")
        .find("div.tab-item")
        .not("div.tab-item:eq(" + searchIndex + ")")
        .hide(10);
      search_tab
        .find(".tab-area")
        .find("div.tab-item:eq(" + searchIndex + ")")
        .show(10);
      k.preventDefault();
    });
    $(".tabTwo ul.tab-menu li").on("click", function (g) {
      var tabTwo = $(this).closest(".tabTwo"),
        index = $(this).closest("li").index();
      tabTwo.find("li").siblings("li").removeClass("active");
      $(this).closest("li").addClass("active");
      tabTwo
        .find(".tab-area")
        .find("div.tab-item")
        .not("div.tab-item:eq(" + index + ")")
        .fadeOut(10);
      tabTwo
        .find(".tab-area")
        .find("div.tab-item:eq(" + index + ")")
        .fadeIn(10);
      g.preventDefault();
    });
    //Odometer
    $(".counter-item").each(function () {
      $(this).isInViewport(function (status) {
        if (status === "entered") {
          for (
            var i = 0;
            i < document.querySelectorAll(".odometer").length;
            i++
          ) {
            var el = document.querySelectorAll(".odometer")[i];
            el.innerHTML = el.getAttribute("data-odometer-final");
          }
        }
      });
    });
    $(".social-icons li a").on("mouseover", function (e) {
      var social = $(this).parent("li");
      if (social.children("a").hasClass("active")) {
        social.siblings("li").children("a").removeClass("active");
        $(this).addClass("active");
      } else {
        social.siblings("li").children("a").removeClass("active");
        $(this).addClass("active");
      }
    });
    $(".tab-slider").owlCarousel({
      loop: true,
      responsiveClass: true,
      nav: false,
      dots: false,
      margin: 30,
      autoplay: true,
      autoplayTimeout: 2000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        768: {
          items: 2,
        },
        992: {
          items: 3,
        },
        1200: {
          items: 4,
        },
      },
    });
    $(".sponsor-slider").owlCarousel({
      loop: true,
      responsiveClass: true,
      nav: false,
      dots: false,
      margin: 30,
      autoplay: true,
      autoplayTimeout: 1500,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        500: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 4,
        },
        1200: {
          items: 5,
        },
      },
    });
    $(".casting-slider").owlCarousel({
      loop: true,
      responsiveClass: true,
      nav: false,
      dots: false,
      margin: 100,
      autoplay: true,
      autoplayTimeout: 2000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        450: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 3,
        },
        1200: {
          items: 4,
        },
      },
    });
    var owl = $(".casting-slider");
    owl.owlCarousel();
    // Go to the next item
    $(".cast-next").on("click", function () {
      owl.trigger("next.owl.carousel");
    });
    // Go to the previous item
    $(".cast-prev").on("click", function () {
      owl.trigger("prev.owl.carousel", [300]);
    });
    $(".casting-slider-two").owlCarousel({
      loop: true,
      responsiveClass: true,
      nav: false,
      dots: false,
      margin: 100,
      autoplay: true,
      autoplayTimeout: 2000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        450: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 3,
        },
        1200: {
          items: 4,
        },
      },
    });
    var owlTT = $(".casting-slider-two");
    owlTT.owlCarousel();
    // Go to the next item
    $(".cast-next-2").on("click", function () {
      owlTT.trigger("next.owl.carousel");
    });
    // Go to the previous item
    $(".cast-prev-2").on("click", function () {
      owlTT.trigger("prev.owl.carousel", [300]);
    });
    $(".details-photos").owlCarousel({
      // loop:true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 5000,
      smartSpeed: 1000,
      margin: 30,
      nav: false,
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        768: {
          items: 3,
        },
        1024: {
          items: 3,
        },
        1200: {
          items: 3,
        },
      },
    });

    // shop cart + - start here
    var CartPlusMinus = $(".cart-plus-minus");
    CartPlusMinus.prepend('<div class="dec qtybutton">-</div>');
    CartPlusMinus.append('<div class="inc qtybutton">+</div>');
    $(".qtybutton").on("click", function () {
      var $button = $(this);
      var oldValue = $button.parent().find("input").val();
      if ($button.text() === "+") {
        var newVal = parseFloat(oldValue) + 1;
      } else {
        // Don't allow decrementing below zero
        if (oldValue > 0) {
          var newVal = parseFloat(oldValue) - 1;
        } else {
          newVal = 1;
        }
      }
      $button.parent().find("input").val(newVal);
    });
    //Speaker Slider
    $(".speaker-slider").owlCarousel({
      loop: true,
      responsiveClass: true,
      nav: false,
      dots: false,
      margin: 30,
      autoplay: true,
      autoplayTimeout: 2000,
      autoplayHoverPause: true,
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 3,
        },
        1200: {
          items: 4,
        },
      },
    });
    var owlT = $(".speaker-slider");
    owlT.owlCarousel();
    // Go to the next item
    $(".speaker-next").on("click", function () {
      owlT.trigger("next.owl.carousel");
    });
    // Go to the previous item
    $(".speaker-prev").on("click", function () {
      owlT.trigger("prev.owl.carousel", [300]);
    });
    //Client SLider
    $(".client-slider").owlCarousel({
      loop: true,
      nav: false,
      dots: true,
      items: 1,
      autoplay: true,
      autoplayTimeout: 2500,
      autoplayHoverPause: true,
    });
    //Count Down JAva Script
    $(".countdown").countdown(
      {
        date: "10/15/2022 05:00:00",
        offset: +2,
        day: "Day",
        days: "Days",
      },
      function () {
        alert("Done!");
      }
    );
    //Widget Slider
    $(".widget-slider").owlCarousel({
      loop: true,
      nav: false,
      dots: false,
      items: 1,
      autoplay: true,
      autoplayTimeout: 2500,
      autoplayHoverPause: true,
      margin: 30,
    });
    var owlBela = $(".widget-slider");
    owlBela.owlCarousel();
    // Go to the next item
    $(".widget-next").on("click", function () {
      owlBela.trigger("next.owl.carousel");
    });
    // Go to the previous item
    $(".widget-prev").on("click", function () {
      owlBela.trigger("prev.owl.carousel", [300]);
    });
    $(".blog-slider").owlCarousel({
      loop: true,
      nav: false,
      dots: false,
      items: 1,
      autoplay: true,
      autoplayTimeout: 2500,
      autoplayHoverPause: true,
    });
    var owlB = $(".blog-slider");
    owlB.owlCarousel();
    // Go to the next item
    $(".blog-next").on("click", function () {
      owlB.trigger("next.owl.carousel");
    });
    // Go to the previous item
    $(".blog-prev").on("click", function () {
      owlB.trigger("prev.owl.carousel", [300]);
    });
  });

  // select seat

  var srcImgSingleSeat;
    $(".seat-free")
      .mouseenter(function() {
        srcImgSingleSeat = $(this).find("img").attr("src");
        if(srcImgSingleSeat == "/user/images/movie/seat01-free.png") {
          $(this).find("img").attr("src", "/user/images/movie/seat01-selecting.png");
        }        
      })
      .mouseleave(function() {
        if(srcImgSingleSeat == "/user/images/movie/seat01-free.png") {
          $(this).find("img").attr("src", srcImgSingleSeat);
        }         
      });

  var selectedSeatList = [];

  function showListOfSeats() {
    let strSeatList = "";
    for(let i = 0; i < selectedSeatList.length; i++) {
      if(i < selectedSeatList.length - 1){
        strSeatList += selectedSeatList[i] + ", ";
      } else {
        strSeatList += selectedSeatList[i];
      }
    }
    $("#currentSeatList").text(strSeatList);
  }

  function calTotalPrice() {
    const price = $("#price").val();
    const totalPrice = price * selectedSeatList.length;
    //$("#totalPrice").text(totalPrice);
    $("#totalPrice").text(parseFloat(totalPrice, 10).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + ' VNĐ');
  }

    
    $(".seat-free").on("click", function (e) {
      if(srcImgSingleSeat == "/user/images/movie/seat01-free.png") {
        let seatCode = $(this).find("span").text();
        let index = selectedSeatList.indexOf(seatCode);
        if (index == -1) {
          if(selectedSeatList.length < 8) {
            // push seat selection into array
            selectedSeatList.push(seatCode);
            // change img of seat
            $(this).find("img").attr("src", "/user/images/movie/seat01-selecting.png");
            srcImgSingleSeat = "/user/images/movie/seat01-selecting.png";
          } else {
            $(".window-warning").removeClass("inActive");
          }     
        }

        //show list of seats
        showListOfSeats();
        calTotalPrice();
        console.log(selectedSeatList);
      } else {
        // change img of seat
        $(this).find("img").attr("src", "/user/images/movie/seat01-free.png");
        srcImgSingleSeat = "/user/images/movie/seat01-free.png";

        // pop seat selection into array
        let seatCode = $(this).find("span").text();
        let index = selectedSeatList.indexOf(seatCode);
        if (index > -1) {
          selectedSeatList.splice(index, 1);
        }

        //show list of seats
        showListOfSeats();
        calTotalPrice();
        console.log(selectedSeatList);
      }
    });

    // submit form seat-plan
    $("#submitSeatPlan").on("click", function (e) {
      $("input[name^='currentSeatList']").val(JSON.stringify(selectedSeatList));   
      $("#formSeatPlan").submit();
    });

    // submit form checkout
    $("#submitCheckout").on("click", function (e) {
      $("#frmCheckout").submit();
    });

})(jQuery);
