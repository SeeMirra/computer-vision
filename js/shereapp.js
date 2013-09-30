'use strict';

var computerVision = angular.module('computerVision', ['ui.ace', 'uiSlider', 'firebase']);

computerVision.controller('VisionCtrl', function ($scope, $timeout, angularFireAuth, angularFire) {
  // page specific settings (will be different per "challenge")
  $scope.details = {};
  $scope.details.name = 'Prototype Challenge';
  $scope.details.discuss = 'http://www.sherecar.org/';
  $scope.details.feedback = 'https://github.com/Self-Driving-Vehicle/computer-vision/issues';
  
  var base = document.getElementById('original');
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  $scope.refreshRate = 600;
  $scope.refreshRateFloor = 100;
  $scope.refreshRateCeiling = 10000;

  $scope.img = 51;
  $scope.$watch('img', function() {
    $scope.process($scope.refreshRate - 100);
  }); 

  $scope.autoUpdate = true;
  $scope.$watch('aceModel', function() {
    if ($scope.autoUpdate){
      $scope.process(1000);
    };
  }); 

  $scope.$watch('firebaseModel', function() {
    $scope.aceModel = $scope.firebaseModel;
  }); 


  $scope.FLOOR = 1;
  $scope.CEILING = 888;
  var play_frame;

  var change_img_frame = function(frame_add) {
    var frame_add = frame_add || 1;
    var frame_inc = parseInt($scope.img) + frame_add;

    if(frame_inc <= $scope.CEILING && frame_inc >=$scope.FLOOR){
      $scope.img = frame_inc;
    }
    else if(frame_inc > $scope.CEILING){
      $scope.img = $scope.FLOOR;
    }
    else if(frame_inc < $scope.FLOOR){
      $scope.img = $scope.CEILING;
    }

    play_frame = $timeout(function(){return change_img_frame(frame_add)}, $scope.refreshRate);
  }

  $scope.stop = function() {
    $timeout.cancel(play_frame);
    $scope.playing = false;
  }

  $scope.fast_forward = function() {
    $timeout.cancel(play_frame);
    change_img_frame(5);
    $scope.playing = true;
  }

  $scope.fast_rewind = function() {
    $timeout.cancel(play_frame);
    change_img_frame(-5);
    $scope.playing = true;
  }
  
  $scope.rewind = function() {
    $timeout.cancel(play_frame);
    change_img_frame(-1);
    $scope.playing = true;
  }

  $scope.play = function() {
    $timeout.cancel(play_frame);
    change_img_frame();
    $scope.playing = true;
  }
  
  // Ace
  $scope.aceOption = {
    mode: 'javascript',
  };
  
  // Note: some final initializations at the bottom

  Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
  }

  NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
      if(this[i] && this[i].parentElement) {
        this[i].parentElement.removeChild(this[i]);
      }
    }
  }

  var run_algo = function(algo_fn) {
    var img = document.getElementById("original");

    var c = document.getElementById("myCanvas");
    c.width = img.width;
    c.height = img.height;

    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var imgData = ctx.getImageData(0, 0, img.width, img.height);

    imgData = algo_fn(imgData);

    ctx.putImageData(imgData,0,0);
  };

  var process = function() {
    eval('var algo;\n' + $scope.aceModel + '\n$scope.algo = algo;');

    if ($scope.algo) {
      run_algo($scope.algo);
    };

    return true;
  }

  $scope.process = function(time) {
    var time = time || 500;
    $timeout(process, time);
  };

  // Final initialization
  var ref;
  ref = new Firebase("https://sherecar.firebaseio.com/code");
  angularFireAuth.initialize(ref, {scope: $scope, name: "user"});

  $scope.login = function() {
    angularFireAuth.login("github");
  };

  $scope.logout = function() {
    angularFireAuth.logout();
  };


  return angularFire(ref, $scope, "firebaseModel");

});
