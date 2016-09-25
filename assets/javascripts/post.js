$(function() {
  var canvas = $('#canvas')[0];
  var ctx = canvas.getContext('2d');
  var bgURL = 'https://images6.alphacoders.com/392/392895.jpg';
  redraw();

  var real_clans = [['Milles', 'TDT'], ['Milles', 'SPTS']];
  var real_mapIDs = [[0, 1, 6, 4, 5], [5, 3, 1, 6, 0]];
  var real_players = [
    [
      ['Lotto', 'groundbeef', 'T', 'P'],
      ['TOP', '風夜影', 'Z', 'P'],
      ['Trippen', '銀河風暴', 'R', 'Z'],
      ['LolitaLife', 'Sapodilla', 'R']
    ],
    [
      ['lotto', '你少給我來這套', 'T', 'Z'],
      ['TOP', '老爺我要', 'Z', 'Z'],
      ['Trippen', '星海宋仲基', 'R', 'P'],
      ['LolitaLife', '老爺不要', 'R', 'Z']
    ]
  ];

  function redraw() {
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
      var clans;
      for (var half = 0; half < 2; half++) {
        centerX = halfCenters[half];
        clans = getClans(half);
        ctx.font = "bold 75px 'Times New Roman'";
        ctx.textAlign = 'right';
        textGlow(clans[0], centerX-80, 200, 'white', '#00ccff', 30, 1);
        ctx.textAlign = 'left';
        textGlow(clans[1], centerX+80, 200, 'white', '#00ccff', 30, 1);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#11cfff';
        textGlow('vs', centerX, 200, '11ccff', '#00f', 50, 1);

        for (var i = 0; i < 4; i++) {
          var players = getPlayers(half, i);
          ctx.fillStyle = 'white';
          ctx.font = "46px '微軟正黑體'";
          ctx.textAlign = 'right';
          textGlow(players[0], centerX - playerSpace, 320 + i * 150, 'white', '#00ccff', 30, 1);
          drawImage(getRaceImg(players[2]), { left: centerX - playerSpace, top: 320 + i * 150, width:65, height: 65, opacity: 0.85, glow: '#fff'})();
          ctx.textAlign = 'left';
          textGlow(players[1], centerX + playerSpace, 320 + i * 150, 'white', '#00ccff', 30, 1);
          drawImage(getRaceImg(players[3]), { left: centerX + playerSpace - 65, top: 320 + i * 150, width:65, height: 65, opacity: 0.85, glow: '#fff'})();

          ctx.textAlign = 'center';

          ctx.font = "38px '微軟正黑體'";
          var map = getMap(half, i);
          textGlow(map.name + ' ' + map.en, centerX, 390 + i * 150, '#11ccff', '#00e', 25, 1);
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

  function getClans(half) {
    if(real_clans) {
      return real_clans[half];
    }
    var clans = ['Rush', 'StroM', 'TDT', 'Milles', 'SPTS'];
    var c1 = Math.floor(Math.random() * clans.length);
    do {
      var c2 =  Math.floor(Math.random() * clans.length);
    } while (c1 === c2);
    return [clans[c1], clans[c2]];
  }
  function getMap(half, i) {
    var maps = [
      { name: '銀河天堂路', en: 'Galactic Process' },
      { name: '神性之地', en: 'Apotheosis' },
      { name: '新蓋茨堡', en: 'New GettysBurg' },
      { name: '世宗研究站', en: 'King Sejong Station' },
      { name: '茶山科學研究站', en: 'Dason Station' },
      { name: '冰霜之地', en: 'Frost' },
      { name: '冰凍神殿', en: 'Frozen Temple' }
    ];
    if(real_mapIDs) {
      return maps[real_mapIDs[half][i]];
    }
    var n = Math.floor(Math.random() * maps.length);
    return maps[n];
  }
  function getRaceImg(race) {
    var races = ['T', 'P', 'Z', 'R'];
    if (!race)
      race = races[Math.floor(Math.random() * races.length)];
    return 'assets/images/race' + race + '.png';
  }
  function getPlayers(half, i) {
    if (real_players) {
      return real_players[half][i];
    }
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
