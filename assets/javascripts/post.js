$(function() {
  var canvas = $('#canvas')[0];
  var ctx = canvas.getContext('2d');
  var bgURL = 'https://images6.alphacoders.com/392/392895.jpg';
  redraw();

  function redraw() {
    var drawbg = bgURL ? drawImage(bgURL, { opacity: 0.4 }) : function(){ return $.when(); };
    var drawlogo = drawImage('assets/images/fbpost_overlay.png');

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 1920, 1080);

    drawbg().done(function() {
      var centerX = 960;
      ctx.save();
      ctx.font = "bold 80px '微軟正黑體'";
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top';
      //ctx.fillText('TACL S4 9/20 賽程表', centerX, 50);

      textGlow('TACL S4 9/20 賽程表', centerX, 50, 'white', '#00ccff', 50, 1);

      var halfSpace = -70;
      var playerSpace = 80;
      var halfCenters = [480 - halfSpace, 1440 + halfSpace];

      for (var half = 0; half < 2; half++) {
        centerX = halfCenters[half];
        var clans = getClans();
        ctx.font = "bold 75px '微軟正黑體'";
        ctx.textAlign = 'right';
        textGlow(clans[0], centerX-80, 180, 'white', '#00ccff', 30, 1);
        ctx.textAlign = 'left';
        textGlow(clans[1], centerX+80, 180, 'white', '#00ccff', 30, 1);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#11cfff';
        textGlow('vs', centerX, 180, '11ccff', '#00ccff', 50, 1);

        for (var i = 0; i < 4; i++) {
          var players = getPlayers();
          ctx.fillStyle = 'white';
          ctx.font = "45px '微軟正黑體'";
          ctx.textAlign = 'right';
          textGlow(players[0], centerX - playerSpace, 320 + i * 150, 'white', '#00ccff', 20, 0);
          drawImage(getRaceImg(), { left: centerX - playerSpace, top: 320 + i * 150, width:65, height: 65, opacity: 0.85, glow: '#00ccff'})();
          ctx.textAlign = 'left';
          textGlow(players[1], centerX + playerSpace, 320 + i * 150, 'white', '#00ccff', 20, 0);
          drawImage(getRaceImg(), { left: centerX + playerSpace - 65, top: 320 + i * 150, width:65, height: 65, opacity: 0.85, glow: '#00ccff'})();


          ctx.textAlign = 'center';

          ctx.font = "35px '微軟正黑體'";
          var map = getMap();
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
  function getClans() {
    var clans = ['Rush', 'StroM', 'TDT', 'Milles', 'SPTS'];
    var c1 = Math.floor(Math.random() * clans.length);
    do {
      var c2 =  Math.floor(Math.random() * clans.length);
    } while (c1 === c2);
    return [clans[c1], clans[c2]];
  }
  function getMap() {
    var maps = [
      { name: '銀河天堂路', en: 'Galactic Process' },
      { name: '新蓋茨堡', en: 'New GettysBurg' },
      { name: '世宗研究站', en: 'King Sejong Station' },
      { name: '茶山科學研究站', en: 'Dason Station' },
      { name: '冰霜之地', en: 'Frost' },
      { name: '冰凍神殿', en: 'Frozen Temple' }
    ];
    var n = Math.floor(Math.random() * maps.length);
    return maps[n];
  }
  function getRaceImg() {
    var races = ['T', 'P', 'Z', 'R'];
    return 'assets/images/race' + races[Math.floor(Math.random() * races.length)] + '.png';
  }
  function getPlayers() {
    var players = ['KevinLiu', 'Shang', 'AntiRush', 'AzureRush', 'Yuin', '台中神秘力量', 'LolitaLife', '無盲點披薩',
      '老爺不要', '宋兄', 'AaCcEe', 'Ryuk', '煌無', '風夜影', '丁丁科', 'ImReady', '新手', 'groundbeef', 'top', 'LoTTo', 'Smile',
      '你少來給我這套', 'Gogokoey', 'TNLRush', 'StarATT', '秋雨梧桐葉落時'];
      var c1 = Math.floor(Math.random() * players.length);
      do {
        var c2 =  Math.floor(Math.random() * players.length);
      } while (c1 === c2);
      return [players[c1], players[c2]];
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
