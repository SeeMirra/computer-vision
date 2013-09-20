'use strict';

var computerVision = angular.module('computerVision', ['ui.ace', 'uiSlider', 'firebase']);

computerVision.controller('VisionCtrl', function ($scope, $timeout, angularFireAuth, angularFire) {
  var base = document.getElementById('original');
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  $scope.img = 51;
  $scope.$watch('img', function() {
    $scope.process(500);
  }); 

  $scope.autoUpdate = true;
  $scope.$watch('aceModel', function() {
    if ($scope.autoUpdate){
      $scope.process(1000);
    };
  }); 
  
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
  ref = new Firebase("https://sherecar.firebaseio.com/");
  angularFireAuth.initialize(ref, {scope: $scope, name: "user"});

  $scope.login = function() {
    angularFireAuth.login("github");
  };

  $scope.logout = function() {
    angularFireAuth.logout();
  };


  return angularFire(ref, $scope, "aceModel");

});
