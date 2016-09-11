// Initialize Firebase
var config = {
  apiKey: "AIzaSyA7t-70TsjQO9vvEYC0jrhOtAe8JbgjHmk",
  authDomain: "tacl-79682.firebaseapp.com",
  databaseURL: "https://tacl-79682.firebaseio.com",
  storageBucket: "tacl-79682.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();

// Calculate width of text from DOM element or string. By Phil Freo <http://philfreo.com>
$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};

(function() {
  var now = new Date();
  var scoreBoard = $('#scoreboard');
  var bgVideo = $('#bg_video');
  var bgAudio = $('#bg_audio');
  var ingameOverlay = $('#ingame_overlay');
  var ingameScoreboard = $('#ingame_scoreboard')

  var ingame = $('.ingame');
  var waiting = $('.waiting');
  var first = $('.first');
  var second = $('.second');
  var fireStates = database.ref('states');


  var monthArr = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  var musicArr = ['eclipse.mp3', 'nova.mp3', 'spectre.mp3']

  var waitingCounter = 0;

  bgAudio.prop('volume', 0);

  fireStates.on('value', function(result) {
    var states = result.val();
    switch (states.scene) {
      case 'waiting':
        bgVideo[0].play();
        bgAudio[0].pause();
        bgAudio[0].src='assets/musics/' + musicArr[waitingCounter++ % musicArr.length]
        bgAudio[0].load();
        bgAudio[0].oncanplaythrough = bgAudio[0].play();
        bgAudio.stop(true, false).animate({volume: 0.5}, 3000);
        waiting.fadeIn();
        ingame.fadeOut();
        break;
      case 'ingame':
        waiting.fadeOut(400, function() {
          bgVideo[0].pause();
        });

        bgAudio.stop(true, false).animate({volume: 0}, 5000, function() {
          bgAudio[0].pause();
        });

        ingame.fadeIn();

        var year = $('.ingame .season .year');
        var date = $('.ingame .season .date');

        year.html(now.getFullYear() + ' <span class="lightblue">S4</span>');
        date.html(monthArr[now.getMonth()] + ' ' + pad(now.getDate(), 2));

        year.css('transform', 'scaleX(' + 180 / year.textWidth() + ') translateY(10px)');
        year.css('transform-origin', '100% 50%')
        date.css('transform', 'scaleX(' + 180 / date.textWidth() + ') translateY(-5px)');
        date.css('transform-origin', (date.textWidth() > 180 ? '0' : '100') + '% 50%')

        break;
      default:
        waiting.fadeOut();
        ingame.fadeOut();
        bgAudio.stop(true, false).animate({volume: 0}, 5000, function() {
          bgAudio[0].pause();
        });
        break;
    }

    switch (states.half) {
      case 'first':
        first.removeClass('semitrans');
        second.addClass('semitrans');
        break;
      case 'second':
        first.addClass('semitrans');
        second.removeClass('semitrans');
        break;
      default:
        first.removeClass('semitrans');
        second.removeClass('semitrans');
        break;
    }

  });
  var fireScore = database.ref('score');
  fireScore.on('value', function(result) {
    var score = result.val();
    //scoreBoard.text(JSON.stringify(score));
    //ingameScoreboard.text(JSON.stringify(score));

    $.each(['first', 'second'], function(i, halfkey) {
      var half = score[halfkey];
      var rule = half.clan1.rule === half.clan2.rule ?
        half.clan1.rule : half.clan1.rule + half.clan2.rule;
      var halftext = (i === 0 ? '上' : '下') + '半場';

      scoreBoard.children('.' + halfkey + '.halftext').html(halftext + ' 賽制 #' + rule);

      scoreBoard.children('.' + halfkey + '.score').html(
         '<span class="lightblue">[' + half.clan1.score + ']</span> ' + pad(half.clan1.name, 6, ' ') +
        '<span class="lightblue"> vs </span>' +
        pad(half.clan2.name, 6, ' ') + ' <span class="lightblue">[' + half.clan2.score + ']</span>');

      ingameOverlay.find('.' + halfkey).html(
        '<span class="lightblue">' + halftext + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' +
        pad(half.clan1.name, 6, ' ') + ' [' + half.clan1.score + ']' +
        '<span class="lightblue"> vs </span>' +
        pad(half.clan2.name, 6, ' ') + ' [' + half.clan2.score + ']' +
        '&nbsp;&nbsp;&nbsp;<span class="lightblue">賽制</span> #' + rule
      )
    });

  });

  $("#ingame_overlay > div:gt(0)").hide();

  setInterval(function() {
    $('#ingame_overlay > div:first')
      .fadeOut(1000)
      .next()
      .fadeIn(1000)
      .end()
      .appendTo('#ingame_overlay');
  }, 15000);


  $('#date').text('TACL S4 ' + pad(now.getMonth() + 1, 2) + '/' + pad(now.getDate(), 2));

  function pad(n, width, z) {
    z = z || '0';
    if (z === ' ') z = '&nbsp';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
})();
