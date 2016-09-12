// Initialize Firebase
var config = {
  apiKey: "AIzaSyA7t-70TsjQO9vvEYC0jrhOtAe8JbgjHmk",
  authDomain: "tacl-79682.firebaseapp.com",
  databaseURL: "https://tacl-79682.firebaseio.com",
  storageBucket: "tacl-79682.appspot.com",
};
firebase.initializeApp(config);
firebase.auth().signOut();

var database = firebase.database();

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

(function() {
  $('.btn-scene').bind('click', function(event) {
    event.preventDefault();
    var btn = $(this);
    btn.addClass('active').siblings().removeClass('active');
    database.ref('states/scene').set(btn.val());
  });

  $('.btn-half').bind('click', function(event) {
    event.preventDefault();
    var btn = $(this);
    btn.addClass('active').siblings().removeClass('active');
    database.ref('states/half').set(btn.val());
  })

  database.ref('states').on('value', function(result) {
    var states = result.val();
    $('.btn-scene').filter('[value="' + states.scene + '"]').addClass('active').siblings().removeClass('siblings');
    $('.btn-half').filter('[value="' + states.half + '"]').addClass('active').siblings().removeClass('siblings');
  });

  $.each(['first', 'second'], function(i, halfkey) {
    database.ref('score').child(halfkey).on('value', function(result) {
      var half = result.val();
      var halfClass = '.' + halfkey;
      $(halfClass + '.clan1').val(half.clan1.name);
      $(halfClass + '.clan2').val(half.clan2.name);
      $(halfClass + '.rule1').val(half.clan1.rule);
      $(halfClass + '.rule2').val(half.clan2.rule);
      $(halfClass + '.score1').val(half.clan1.score);
      $(halfClass + '.score2').val(half.clan2.score);
    });
  });
  $('.btn-update').bind('click', function(event) {
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
