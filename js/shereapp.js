'use strict';

var computerVision = angular.module('computerVision', ['ui.ace', 'firebase']);

computerVision.controller('VisionCtrl', function ($scope, angularFire) {
  var base = document.getElementById('original');
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');

  $scope.img = 51;
  $scope.$watch('img', function() {
    $scope.process(500);
  }); 
  
  // Ace
  $scope.aceOption = {
    mode: 'javascript',
  };
  
  // Note: some final initializations at the bottom
  
  $scope.process = function() {
    var code_preview = document.getElementById('ace_code');
    var algo_code = ace.edit("code_preview").getValue();

    var code_runner = document.getElementById('code_runner'); 

    if (code_runner) {
      code_runner.remove();
    }

    code_runner = document.createElement('script');
    code_runner.id = 'code_runner';
    var code = document.createTextNode(algo_code);
    code_runner.appendChild(code);

    document.body.insertBefore(code_runner, code_preview.nextSibling);
  };
  
  // Final initialization
  var ref;
  ref = new Firebase("https://sherecar.firebaseio.com/code");
  return angularFire(ref, $scope, "aceModel");

});
