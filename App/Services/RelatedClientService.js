(function (module) {
    'use strict';

    function relatedClientService($resource, $http) {
        return {
            id: ""
        };
    }
    module.factory("relatedClientService", ["$resource", "$http", relatedClientService]);
})(angular.module("relatedClientServices", ["ngResource"]));
