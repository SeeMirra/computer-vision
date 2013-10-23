'use strict';

computerVision.factory('serverProcessService', function($http, $q) {  
  var service = {};
  service.callServer = function (url, image, callback) {
    var deferred = $q.defer();
    // gonna hardcode &img=$image for now
    $http.get(url+'?img='+image).success(function(result) {
      deferred.resolve(result);
    }).error(function(){
      deferred.reject();
    });
    return deferred.promise;
  };
  // consider a 'post' version
  
  return service;
});