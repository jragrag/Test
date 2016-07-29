(function (module) {
    "use strict";

    function lookupService($resource, $http) {
        return {
            id: "",
            getID: function () { return this.id },
            getInfo: function () {
                return $http.get(String.format("{0}/api/Conference/{1}/AdditionalInfo", window.baseUiUrl, this.id));
            },
            setAdditionalInfo: function (data) {
                return $http.put(String.format("{0}/api/Conference/{1}/AdditionalInfo", window.baseUiUrl, this.id), data);
            },
            getPeople: function (person) {
                return $http.get(String.format("{0}/api/getPeople?person={1}", window.baseUiUrl, person));
            },
            createConference: function (data) {
                return $http.post(String.format("{0}/api/Conference", window.baseUiUrl), data);
            },
            setTitleAndDate: function (data) {
                return $http.put(String.format("{0}/api/Conference/{1}/TitleAndDate", window.baseUiUrl, this.id), data);
            },
            getTitleAndDate: function () {
                return $http.get(String.format("{0}/api/Conference/{1}/TitleAndDate", window.baseUiUrl, this.id));
            },
            getMLLocation: function () {
                return $http.get(String.format("{0}/api/Conference/{1}/MLLocations", window.baseUiUrl, this.id), {}, { isArray: true });
            },
            setMLLocation: function (data) {
                return $http.put(String.format("{0}/api/Conference/{1}/MlLocations", window.baseUiUrl, this.id), data);
            },
            getClientLocations: function () {
                return $http.get(String.format("{0}/api/Conference/{1}/ClientLocations", window.baseUiUrl, this.id));
            },
            setClientLocations: function (data) {
                return $http.put(String.format("{0}/api/Conference/{1}/ClientLocations", window.baseUiUrl, this.id), data);
            },
            getConference: function () {
                return $http.get(String.format("{0}/api/Conference", window.baseUiUrl));
            }
        };
    };

    module.factory("lookupService", ["$resource", "$http", lookupService]);
}(angular.module("commonServices", ["ngResource"])));