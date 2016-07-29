(function (module) {
    'use strict';

    function homeService($resource, $http) {
        return {
            id: "",
            baseApiUrl: String.format("{0}/api", window.baseApiUrl),
            getSearchResults: function (param) {
                var url = String.format("{0}/search", this.baseApiUrl);
                return $http({
                    url: url,
                    dataType: 'json',
                    method: 'POST',
                    data: param,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

            },
            getSelectedSearches: function (searchText) {
                var url = String.format("{0}/suggestedsearch", this.baseApiUrl);
                return $http({
                    url: url,
                    dataType: 'json',
                    method: 'POST',
                    data: JSON.stringify(searchText),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            saveUserDefaultFilter: function (param) {
                var url = String.format("{0}/savefilter", this.baseApiUrl);
                return $http({
                    url: url,
                    dataType: 'json',
                    method: 'POST',
                    data: param,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            getUserDefaultFilter: function (user) {
                var url = String.format("{0}/filter", this.baseApiUrl);
                return $http({
                    url: url,
                    dataType: 'json',
                    method: 'POST',
                    data: JSON.stringify(user),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            getRefinerAutocompletes: function (param, refinerGroup) {
                var url = String.format("{0}/refinerautocomplete/{1}", this.baseApiUrl, refinerGroup);
                return $http({
                    url: url,
                    dataType: 'json',
                    method: 'POST',
                    data: param,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },
            getRefinerSource: function (refinerGroup) {                
                var url = String.format("{0}/refinerSource", this.baseApiUrl);
                return $http({
                    url: url,
                    dataType: 'json',
                    method: 'POST',
                    data: JSON.stringify(refinerGroup),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            },            
            getRelatedClient: function (clientNumber) {
                return $http.get(String.format("{0}/getRelatedClient/{1}", this.baseApiUrl, clientNumber));
            },
            getClient: function (clientNumber) {
                return $http.get(String.format("{0}/getClient/{1}", this.baseApiUrl, clientNumber));
            },
            getMetrics: function (clientNumber, type) {
            return $http.get(String.format("{0}/getmetrics/{1}/{2}", this.baseApiUrl, clientNumber, type ));
            }
        };
    }
    module.factory("homeService", ["$resource", "$http", homeService]);
})(angular.module("homeServices", ["ngResource"]));