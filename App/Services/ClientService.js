(function (module) {
    'use strict';

    function clientService($resource, $http) {
        return {
            id: "",
            baseApiUrl: String.format("{0}/api", window.baseApiUrl),
            getMetricInfo: function () {
                return $http.get(this.baseApiUrl + "/getmetricinfo");
            }
        };
    }
    module.factory("clientService", ["$resource", "$http", clientService]);
})(angular.module("clientServices", ["ngResource"]));