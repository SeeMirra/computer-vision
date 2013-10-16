'use strict';

var computerVision = angular.module('computerVision', ['ui.ace', 'ui.bootstrap', 'uiSlider', 'firebase'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {templateUrl: 'partials/home.html'})
      .when('/references', {templateUrl: 'partials/references.html'})
      .when('/editor', {templateUrl: 'partials/editor.html'})
      .when('/editor/:codeId', {templateUrl: 'partials/editor.html'})
      .when('/challenges', {templateUrl: 'partials/challenges/intro.html'})
      .otherwise({
        redirectTo: '/'
      });
  });

computerVision.controller('VisionCtrl', function ($scope, $routeParams, $timeout, angularFireAuth, angularFire) {
  // page specific settings (will be different per "challenge")
  $scope.details = {};
  $scope.details.name = 'Prototype Challenge';
  $scope.details.description = 'This is currently a prototype page for the ShereCar Vision Algorithm project. These types of pages will serve as a example platform for users to create and test vision algorithms';
  $scope.details.discuss = 'http://www.sherecar.org/';
  $scope.details.feedback = 'https://github.com/Self-Driving-Vehicle/computer-vision/issues';
  
  // Page properties
  var base = document.getElementById('original');
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  var saveBase = 'submits/';
  
  // Angular models
  $scope.saved = {};
  $scope.saved.link = '';
  $scope.saved.base = 'http://vision.sherecar.org/vision/';
  
  $scope.playControls = 'play';
  $scope.hideDescription = false;

  // "Frame" numbers
  $scope.img = 51;          // Before image count w/ initial number
  $scope.FLOOR = 1;
  $scope.CEILING = 888;
  
  var codeId = '';          // Code sourced based on routing
  var play_frame;
  
  // Note: some final initializations at the bottom
  
  $scope.$on('$routeChangeSuccess', function() {
    var codeParams = $routeParams;
    if (codeParams.codeId) {
      codeId = codeParams.codeId;
      codeYours.child(codeId).once('value', function(snapshot) {
        if (snapshot.val() === null) {
          alert('No code exists at: ' + codeId);
          codeId = 'default';
        }
      });
    }
    else {
      codeId = 'default';
    }
  });
  
  $scope.$watch('defaultModel', function() {
    if (codeId == 'default') {
      $scope.aceModel = $scope.defaultModel;
    }
  }); 

  $scope.$watch('yourModel', function() {
    if (codeId) {
      $scope.aceModel = $scope.yourModel[codeId]['code'];
    }
  }); 

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

    showImage(frame_add);
  }

  var showImage = function(frame_add) { 
    loadImage(
      '/static/images/image'+$scope.img+'.png',
      function (img) {
        img.setAttribute('id', 'original');
        var original_container = document.getElementById('original-image');
        var original_image = original_container.firstChild;
        if(original_image) {
          original_container.removeChild(original_container.firstChild);
        }
        original_container.appendChild(img);
        $scope.process();
        play_frame = $timeout(function(){ return change_img_frame(frame_add); }, 1000);
      },
      {maxWidth: 500} // Options
    );
  }

  $scope.stop = function() {
    $timeout.cancel(play_frame);
    $scope.playing = false;
    $scope.playControls = 'stop';
  }

  $scope.fast_forward = function() {
    $timeout.cancel(play_frame);
    change_img_frame(5);
    $scope.playing = true;
    $scope.playControls = 'forward';
  }

  $scope.fast_rewind = function() {
    $timeout.cancel(play_frame);
    change_img_frame(-5);
    $scope.playing = true;
    $scope.playControls = 'back';
  }
  
  $scope.rewind = function() {
    $timeout.cancel(play_frame);
    change_img_frame(-1);
    $scope.playing = true;
    $scope.playControls = 'reverse';
  }

  $scope.play = function() {
    $timeout.cancel(play_frame);
    change_img_frame();
    $scope.playing = true;
    $scope.playControls = 'play';
  }
  
  // Ace
  $scope.aceOption = {
    mode: 'javascript',
  };

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
  
  $scope.save = function() {
    var childURL = saveBase + $scope.details.name + '/' + $scope.user.uesrname + '/';
    var submit = codeYours.child(childURL).push();
    $scope.saved.link = submit.name();
    $scope.yourModel[submit.name()] = {
      user: $scope.user.username, code: $scope.aceModel
    };
  };

  // Final initialization
  
  // set up firebase references to default code
  var codeDef = new Firebase("https://sherecar.firebaseio.com/vision/defaults/" + $scope.details.name);
  angularFire(codeDef, $scope, "defaultModel");
  var codeYours = new Firebase("https://sherecar.firebaseio.com/vision/submits/" + $scope.details.name);
  angularFire(codeYours, $scope, "yourModel");

  angularFireAuth.initialize(codeDef, {scope: $scope, name: "user"});
  $scope.login = function() {
    angularFireAuth.login("github");
  };
  $scope.logout = function() {
    angularFireAuth.logout();
  };
});
