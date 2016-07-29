(function (module) {
    'use strict';

    function userService($resource, $http) {
        return {
            id: "",
            getCurrentUser: function () {
                return $http.get(window.baseUiUrl + "/Home/GetCurrentUser");
            }
        };
    }
    module.factory("userService", ["$resource", "$http", userService]);
})(angular.module("userServices", ["ngResource"]));