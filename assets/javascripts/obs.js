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

$.fn.prevOrLast = function(selector)
{
  var prev = this.prev(selector);
  return (prev.length) ? prev : this.nextAll(selector).last();
};

$(function() {
  var now = new Date();
  var scoreBoard = $('#scoreboard');
  var mainDate = $('#date');
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
  var noSoundTime = 0;

  bgAudio.prop('volume', 0);

  var audioSource = new AudioSource('bg_audio');
  var canvasElement = document.getElementById('canvas');

  var power, energy, scale = 1, decayScale = 0, smoothedScale = 0, decayScale = 0;
  var draw = function() {
      if (!bgAudio[0].paused) {
        var final = 0;
        var careFreq = Math.floor(audioSource.streamData.length / 10);
        for(bin = 0; bin < careFreq; bin ++) {
            var val = audioSource.streamData[bin];
            final += val;
        }

        var energy = final / careFreq / 256;

        scale = 1;
        power = Math.exp(energy)
        scale = scale * power;
        decayScale = Math.max(decayScale, scale);

        smoothedScale += (decayScale - smoothedScale) * 0.3;

        decayScale = decayScale * 0.985;

        $('.audioscale').css('transform', 'scale(' + smoothedScale + ')');
      }
      requestAnimationFrame(draw);
  };

  draw();
  function playNextSong() {
    bgAudio[0].pause();
    bgAudio[0].src='https://fonger.github.io/TACL/assets/musics/' + musicArr[waitingCounter++ % musicArr.length]
    bgAudio[0].crossOrigin = 'anonymous';
    bgAudio[0].load();
    bgAudio[0].oncanplaythrough = function() {
      bgAudio[0].play();
      bgAudio.stop(true, false).animate({volume: 0.35}, 3000);
    }
  }
  var defaultCardStyle = {
    opacity: 0,
    borderSpacing: 1,
    transform: 'scale(1)'
  };
  fireStates.child('scene').on('value', function(result) {
    switch (result.val()) {
      case 'waiting':
        if (Date.now() - noSoundTime > 15000) {
          playNextSong();
        } else {
          if (!bgAudio[0].src || bgAudio[0].src === '') {
            playNextSong();
          } else {
            bgAudio[0].play();
            bgAudio.stop(true, false).animate({volume: 0.35}, 3000);
          }
        }
        bgVideo[0].play();
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
        noSoundTime = new Date().getTime();
        break;
      default:
        waiting.fadeOut(400, function() {
          bgVideo[0].pause();
        });
        ingame.fadeOut();
        bgAudio.stop(true, false).animate({volume: 0}, 5000, function() {
          bgAudio[0].pause();
        });
        noSoundTime = new Date().getTime();
        break;
    }
  });
  fireStates.child('half').on('value', function(result) {
    switch (result.val()) {
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
  var countdown = false;
  var destDate;
  fireStates.child('card').on('value', function(result) {
    $('.card').not('.removed').addClass('removing');
    var card = result.val();
    countdown = false;
    switch (card.type) {
      case 'thanks':
        var newCard = $('<div class="card infotext"/>').css(defaultCardStyle)
          .html('<div class="bottom-spacing">感謝您的收看 每週六日晚上八點</div>' +
            '<div class="bottom-spacing">敬請鎖定 TACL Twitch 頻道直播</div>');
        newCard.appendTo($('#waiting_overlay'));
      case 'custom':
        if(card.message === '') card.message = '無訊息'

        if (card.message.indexOf('@cd') !== -1) {
          card.message = card.message.replace('@cd', '&nbsp;&nbsp;&nbsp;<span class="countdown audioscale lightblue"></span>&nbsp;&nbsp;&nbsp;');
          destDate = new Date();
          var arr = card.time.split(':');
          destDate.setHours(arr[0], arr[1], 0, 0);
          countdown = true;
        } else {
          countdown = false;
        }
        var newCard = $('<div class="card infotext"/>').css(defaultCardStyle)
          .html('<div class="bottom-spacing">' + card.message + '</div>')
        newCard.appendTo($('#waiting_overlay'));
        updateCountdown();
        break;
      default:
        break;
    }

  })

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
        pad(half.clan1.name, 6, ' ') +
        '&nbsp;&nbsp;<span class="lightblue audioscale">' + half.clan1.score + '</span>&nbsp;：&nbsp;<span class="lightblue audioscale">' + half.clan2.score + '</span>&nbsp;&nbsp;' +
        pad(half.clan2.name, 6, ' ', true)
      );

      ingameOverlay.find('.' + halfkey).html(
        '<span class="lightblue">' + halftext + '</span>&nbsp;&nbsp;&nbsp;&nbsp;' +
        pad(half.clan1.name, 6, ' ') + ' [' + half.clan1.score + ']' +
        '<span class="lightblue"> vs </span>' +
        pad(half.clan2.name, 6, ' ') + ' [' + half.clan2.score + ']' +
        '&nbsp;&nbsp;&nbsp;<span class="lightblue">賽制</span> #' + rule
      )
    });

  });

  var fireInfo = database.ref('info');
  fireInfo.on('value', function(result) {
    var info = result.val();
    $('.info').not('.removed').addClass('removing');
    var spaces = Math.max(8,spaceLength(info.refuree), spaceLength(info.caster), spaceLength(info.broadcaster)) + 1;
    var newCard = $('<div class="info infotext"/>')
      .css(defaultCardStyle)
      .html('<div class="bottom-spacing">裁判 ' + pad(info.refuree, spaces, ' ') + '</div>' +
        '<div class="bottom-spacing">賽評 ' + pad(info.caster, spaces, ' ') + '</div>' +
        '<div class="bottom-spacing">轉播 ' + pad(info.broadcaster, spaces, ' ') + '</div>');
    newCard.appendTo($('#waiting_overlay'));
  });

  var firstLoaded = true;;
  database.ref('reload').on('value', function(result) {
    if (!firstLoaded) {
      location.reload();
    }
    firstLoaded = false;
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

  function updateCountdown() {
    if (countdown) {
      $('.countdown').html(toHHMMSS(destDate.getTime() - Date.now()));
    }
  }

  setInterval(updateCountdown, 1000);

    $("#waiting_overlay > div:gt(0)")
    .css(defaultCardStyle);
    var i = 0;
    setInterval(function() {
      var stack = $('#waiting_overlay > div').not('.removed')
      if (stack.length === 1) return;
      stack.first()
        .css('border-spacing', 1)
        .css('transform', 'scale(1)')
        .animate({
          opacity: 0,
        }, 1500)
        .animate({
          borderSpacing: 0.5
        }, {
          step: function(now, fx) {
            $(this).css('transform', 'scale(' + now + ')')
          },
          complete: function() {
              $(this).filter('.removing').addClass('removed').removeClass('removing');
          },
          duration: 1500,
          queue: false
        }, 'swing')
        .nextAll(':not(.removed):first')
        .css('border-spacing', 2)
        .css('transform', 'scale(2)')
        .animate({
          opacity: 1,
          left: 0,
          top: 0
        }, 1500)
        .animate({
          borderSpacing: 1
        }, {
          step: function(now, fx) {
            $(this).css('transform', 'scale(' + now + ')')
          },
          duration: 1500,
          queue: false
        }, 'swing')
        .end()
        .appendTo('#waiting_overlay');
    }, 8000);

  mainDate.text('TACL S4 ' + pad(now.getMonth() + 1, 2) + '/' + pad(now.getDate(), 2));

  function pad(n, width, z, reverse) {
    z = z || '0';
    if (z === ' ') z = '&nbsp';
    n = n + '';
    var length = spaceLength(n);
    if (length >= width) return n;
    var p = new Array(width - length + 1).join(z);
    return reverse ? n + p : p + n;
  }

  function spaceLength(str) {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i=str.length-1; i>=0; i--) {
      var code = str.charCodeAt(i);
      if (code > 0x7f && code <= 0x7ff) s++;
      else if (code > 0x7ff && code <= 0xffff) s++;
      if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }
    return s;
  }

  function toHHMMSS(milliseconds) {
		if(milliseconds < 0) milliseconds = 0;
    var second = Math.floor(milliseconds / 1000);
    if (second < 3600) {
		  return [parseInt(second / 60, 10), second % 60].join(":").replace(/\b(\d)\b/g, "0$1");
    } else {
      return [parseInt(second / 3600, 10), parseInt(second / 60 % 60,10), second % 60].join(":").replace(/\b(\d)\b/g, "0$1");
    }
  }
});
