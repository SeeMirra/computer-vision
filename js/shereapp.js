'use strict';

var computerVision = angular.module('computerVision', ['ui.ace', 'firebase']);

computerVision.controller('VisionCtrl', function ($scope, angularFire) {
  var base = document.getElementById('original');
  var canvas = document.getElementById('canvas');
  //var context = canvas.getContext('2d');
  
  $scope.aceOption = {
    mode: 'javascript',
  };
  
  // Initial code content...
  var ref;
  ref = new Firebase("https://sherecar.firebaseio.com/code");
  return angularFire(ref, $scope, "aceModel");
});