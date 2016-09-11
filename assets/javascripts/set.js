// Initialize Firebase
var config = {
  apiKey: "AIzaSyA7t-70TsjQO9vvEYC0jrhOtAe8JbgjHmk",
  authDomain: "tacl-79682.firebaseapp.com",
  databaseURL: "https://tacl-79682.firebaseio.com",
  storageBucket: "tacl-79682.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();

var connectedRef = database.ref(".info/connected");
connectedRef.on("value", function(snap) {
  if (snap.val() === true) {
    $('#loading').fadeOut();
  } else {
    $('#loading h1').text('失去連線');
    $('#loading').fadeIn();
  }
});

(function() {
  var btnIngame = $('#btn_scene_ingame');
  var btnWaiting = $('#btn_scene_waiting');
  var btnHide = $('#btn_scene_hide');
  var sceneButtons = $('.btn-scene');
  var halfButtons = $('.btn-half');
  var updateButtons = $('.btn-update');

  sceneButtons.bind('click', function(event) {
    event.preventDefault();
    sceneButtons.removeClass('active');
    var btn = $(this).addClass('active');
    database.ref('states/scene').set(btn.val());
  });

  halfButtons.bind('click', function(event) {
    event.preventDefault();
    halfButtons.removeClass('active');
    var btn = $(this).addClass('active');
    database.ref('states/half').set(btn.val());
  })

  updateButtons.bind('click', function(event) {
    event.preventDefault();
    var btn = $(this);
    var half = btn.val();

    var halfClass = '.' + half;

    var clan1 = $(halfClass + '.clan1').val();
    var clan2 = $(halfClass + '.clan2').val();
    var rule1 = $(halfClass + '.rule1').val();
    var rule2 = $(halfClass + '.rule2').val();
    var score1 = $(halfClass + '.score1').val();
    var score2 = $(halfClass + '.score2').val();

    database.ref('score').child(half).set({
      clan1: {
        name: clan1,
        rule: rule1,
        score: score1
      },
      clan2: {
        name: clan2,
        rule: rule2,
        score: score2
      }
    });

  });

})();
