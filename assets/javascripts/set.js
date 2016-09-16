// Initialize Firebase
var config = {
  apiKey: "AIzaSyA7t-70TsjQO9vvEYC0jrhOtAe8JbgjHmk",
  authDomain: "tacl-79682.firebaseapp.com",
  databaseURL: "https://tacl-79682.firebaseio.com",
  storageBucket: "tacl-79682.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

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

  $('.btn-scene').bind('click', function(event) {
    event.preventDefault();
    var btn = $(this);
    btn.addClass('active').siblings().removeClass('active');
    database.ref('states/scene').set(btn.val());
  });

  $('.btn-card').bind('click', function(event) {
    event.preventDefault();
    var btn = $(this);
    btn.addClass('active').siblings().removeClass('active');
    $('#custom_msg').prop('disabled', btn.val() === 'custom');
    $('#countdown_time').prop('disabled', btn.val() === 'custom');
    if(btn.val() === 'custom') {
      $('.custom-active').show();
      $('.custom-inactive').hide();
    } else {
      $('.custom-active').hide();
      $('.custom-inactive').show();
    }
    database.ref('states/card').set(
      {
        type: btn.val(),
        message: $('#custom_msg').val(),
        time: $('#countdown_time').val()
      });
  });


  $('.btn-half').bind('click', function(event) {
    event.preventDefault();
    var btn = $(this);
    btn.addClass('active').siblings().removeClass('active');
    database.ref('states/half').set(btn.val());
  })

  database.ref('states').on('value', function(result) {
    var states = result.val();
    $('.btn-scene').filter('[value="' + states.scene + '"]').addClass('active').siblings().removeClass('active');
    $('.btn-half').filter('[value="' + states.half + '"]').addClass('active').siblings().removeClass('active');
    $('.btn-card').filter('[value="' + states.card.type + '"]').addClass('active').siblings().removeClass('active');
    $('#custom_msg').prop('disabled', states.card.type === 'custom');
    $('#countdown_time').prop('disabled', states.card.type === 'custom');

    if(states.card.type === 'custom') {
      $('.custom-active').show();
      $('.custom-inactive').hide();
    } else {
      $('.custom-active').hide();
      $('.custom-inactive').show();
    }

    $('#countdown_time').val(states.card.time);
    if (states.card.message) {
      $('#custom_msg').val(states.card.message);
    }
  });

  $('[data-realtime]')
  .each(function() {
    var input = $(this);
    var target = input.data('target');
    if(target && target !== '') {
      database.ref(target).on('value', function(result) {
        input.val(result.val());
      });
    }
  })
  .change(function() {
    var input = $(this);
    var target = input.data('target');
    if(target && target !== '') {
      database.ref(target).set(input.val());
    }
  })

  database.ref('info').on('value', function(result) {
    var info = result.val();
    $('#refuree').val(info.refuree);
    $('#caster').val(info.caster);
    $('#broadcaster').val(info.broadcaster);
  });

  $('#btn_update_info').bind('click', function(event) {
    event.preventDefault();
    database.ref('info').set({
      refuree: $('#refuree').val(),
      caster: $('#caster').val(),
      broadcaster: $('#broadcaster').val()
    });
  });
  $('#btn_force_reload').bind('click', function(event) {
    event.preventDefault();
    database.ref('reload').set(Math.random());
  });
});
