// Initialize Firebase
var config = {
  apiKey: "AIzaSyA7t-70TsjQO9vvEYC0jrhOtAe8JbgjHmk",
  authDomain: "tacl-79682.firebaseapp.com",
  databaseURL: "https://tacl-79682.firebaseio.com",
  storageBucket: "tacl-79682.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();
var data = { season: 4 }

$(function() {
  var connectedRef = database.ref(".info/connected");
  connectedRef.on("value", function(snap) {
    if (snap.val() === true) {
      $('#loading').stop(true, false).fadeOut();
    } else {
      $('#loading').stop(true, false).fadeIn();
    }
  });

  $('#btn_login').bind('click', function(event) {
    event.preventDefault();
    var login_spinner = $('#login_spinner').show();

    firebase.auth().signInWithEmailAndPassword('spycraft@tacl.com', $('#password').val())
    .then(function() {
      login_spinner.hide();
    })
    .catch(function(error) {
      // Handle Errors here.
      $('.login.alert').fadeIn();
      $('#login_error_msg').html(error.message);
      login_spinner.hide();
    })
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
      $('#loginModal').modal('hide');
    } else {
      $('#loginModal').modal('show');
    }
  });


  var canvas = $('#canvas')[0];
  var ctx = canvas.getContext('2d');
  var bgList = [
    'http://1920x1080hdwallpapers.com/image/201512/games/3859/starcraft-2-legacy-of-void-spear-of-adun-art.jpg',
    'https://images6.alphacoders.com/392/392895.jpg',
    'https://images.alphacoders.com/464/464155.jpg',
    'http://wallpaperswide.com/download/starcraft_ii_heart_of_the_swarm___zerg_hive-wallpaper-1920x1080.jpg'
  ];
  var bgURL = bgList[Math.floor(Math.random() * bgList.length)];

  database.ref('game').on('value', function(result) {
    data.season = result.val().season;
  });
  database.ref('score').on('value', function(result) {
    data.score = result.val();
    redraw();
  });

  $('[data-realtime]')
  .each(function() {
    var input = $(this);
    var target = input.data('target');
    if(target && target !== '') {
      database.ref(target).on('value', function(result) {
        input.val(result.val());
        if(input.hasClass('selectpicker')) {
          input.selectpicker('refresh');
        }
      });
    }
  })
  .change(function() {
    var input = $(this);
    var target = input.data('target');
    if(target && target !== '') {
      database.ref(target).set(input.val());
      redraw();
    }
  })

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var drawbg = bgURL ? drawImage(bgURL, { opacity: 0.4 }) : function(){ return $.when(); };
    var drawlogo = drawImage('assets/images/fbpost_overlay.png');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 1920, 1080);

    drawbg().done(function() {
      var centerX = 960;
      ctx.save();
      ctx.font = "bold 80px 'Times New Roman', '微軟正黑體'";
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top';
      //ctx.fillText('TACL S4 9/20 賽程表', centerX, 50);

      textGlow('TACL S4 9/25 賽程表', centerX, 50, 'white', '#00ccff', 50, 1);

      var halfSpace = -70;
      var playerSpace = 80;
      var halfCenters = [480 - halfSpace, 1440 + halfSpace];

      for (var halfId = 0; halfId < 2; halfId++) {
        centerX = halfCenters[halfId];
        var half = data.score[halfId===0 ? 'first' : 'second'];
        ctx.font = "bold 75px 'Times New Roman'";
        ctx.textAlign = 'right';
        textGlow(half.clan1.name, centerX-80, 200, 'white', '#00ccff', 30, 1);
        ctx.textAlign = 'left';
        textGlow(half.clan2.name, centerX+80, 200, 'white', '#00ccff', 30, 1);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#11cfff';
        textGlow('vs', centerX, 200, '11ccff', '#00f', 50, 1);

        for (var i = 0; i < 4; i++) {
          ctx.fillStyle = 'white';
          ctx.font = "46px '微軟正黑體'";
          ctx.textAlign = 'right';
          var player1 = half.clan1.players[i];
          textGlow(player1.name, centerX - playerSpace, 320 + i * 150, 'white', '#00ccff', 30, 1);
          drawImage(getRaceImg(player1.race), { left: centerX - playerSpace, top: 320 + i * 150, width:65, height: 65, opacity: 0.85, glow: '#fff'})();
          ctx.textAlign = 'left';
          var player2 = half.clan2.players[i];
          textGlow(player2.name, centerX + playerSpace, 320 + i * 150, 'white', '#00ccff', 30, 1);
          drawImage(getRaceImg(player2.race), { left: centerX + playerSpace - 65, top: 320 + i * 150, width:65, height: 65, opacity: 0.85, glow: '#fff'})();

          ctx.textAlign = 'center';

          ctx.font = "38px '微軟正黑體'";
          textGlow(half.maps[i], centerX, 390 + i * 150, '#11ccff', '#00e', 25, 1);
        }
      }
      drawlogo();
    });
  }
  function textGlow(text, x, y, color, glowColor, blur, level) {
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    for (var i = 0; i < level; i++) {
      ctx.fillText(text, x, y);
    }
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function getRaceImg(race) {
    return 'assets/images/race' + race + '.png';
  }

  function drawImage(url, options) {
    return function() {
      var deferred = $.Deferred();
      var img = new Image;
      if (!options) options = {};
      img.onload = function(){
        ctx.save();
        if (options.opacity) {
          ctx.globalAlpha = options.opacity;
        }
        if (options.glow) {
          ctx.shadowColor = options.glow;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 20;
        }
        ctx.drawImage(img, options.left || 0, options.top || 0, options.width || 1920, options.height || 1080);
        ctx.restore();
        deferred.resolve();
      };
      img.src = url;
      return deferred.promise();
    }
  }
});
