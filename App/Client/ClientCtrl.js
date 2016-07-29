(function (module) {
    "use strict";

    function clientCtrl($scope, mlb, homeService, modalService, clientService) {
        var vm = this;
        var scope = $scope;
        var parentScope = scope.$parent;
        var constants = parentScope.constants;

        vm.getClient = function () {
            if (typeof (scope.selectedClientNumber) === 'undefined') {
                mlb.redirect("home");
            }
            parentScope.progressBar().start();

            homeService.getClient(scope.selectedClientNumber)
                .success(function (result) {
                    scope.client = result;
                })
                .error(function (result) {
                    mlb.showToast(result.message);
                })
                .then(function () {
                    parentScope.progressBar().complete();
                    scope.showPage = true;
                });
            window.scrollTo(0, 0);
        };

        vm.searchOnClick = function (searchText) {
            if (scope.searchText.length < 3 && scope.searchText.length !== 0) {
                scope.isNoResult = true;
                scope.resultMessage = 'Search term must be a minimum of 3 characters.';
                return false;
            }
            else {
                scope.isNoResult = false;
                scope.$parent.prevState = "client";
                scope.searchParameters.SearchText = searchText;
                scope.searchParameters.SuggestedSearchItem = null;
                vm.setDefaultRefiner();
                scope.$parent.searchParameters = scope.searchParameters;
                mlb.redirect("home");
            }
        };

        vm.createPdfVersion = function () {
            var linkUrl = String.format('{0}/api/generateClientPdf/{1}', window.baseApiUrl, scope.client.ClientNumber);
            window.location.href = linkUrl;
        };

        vm.getAssociatedClient = function (clientNumber) {
            scope.$parent.selectedClientNumber = clientNumber;
            vm.getClient();
        };

        vm.getRelatedClient = function (clientNumber) {
            scope.$parent.selectedClientNumber = clientNumber;
            scope.$parent.searchParameters = scope.searchParameters;
            mlb.redirect("relatedclient");
        };

        vm.backToSearchResults = function () {
            scope.$parent.prevState = "client";
            scope.$parent.searchParameters = scope.searchParameters;
            mlb.redirect("home");
        };

        vm.showRelatedClientNumber = function (relatedClientNumber) {
            var showNumber = true;
            if (relatedClientNumber === "-1") {
                showNumber = false;
            }
            return showNumber;
        };

        vm.getSuggestedSearches = function (searchText) {

            return homeService.getSelectedSearches(searchText)
                 .then(function (response) {
                     return response.data;
                 });

        };

        vm.suggestedClientOnSelect = function (clientNumber, type) {
            scope.$parent.selectedClientNumber = clientNumber;
            scope.$parent.searchParameters = scope.searchParameters;

            switch (type) {
                case constants.CLIENT_CLIENTTYPE:
                    vm.getClient();
                    break;
                case constants.RELATEDCLIENT_CLIENTTYPE:
                    mlb.redirect("relatedclient");
                    break;
                default:
                    mlb.redirect("home");
            }
        };

        vm.attorneyOnSelect = function (attorney) {
            scope.searchParameters.SearchText = null;
            scope.searchParameters.SuggestedSearchItem = attorney;
            vm.setDefaultRefiner();
            scope.$parent.searchParameters = scope.searchParameters;
            scope.$parent.prevState = "client";
            mlb.redirect("home");
        };

        vm.setDefaultRefiner = function () {
            scope.searchParameters.SelectedRefiners = [];
            var currentRefiner = {
                Group: 'Status',
                Key: 'Current',
                Name: 'Current',
                Count: 0,
                IsSelected: true
            };
            scope.searchParameters.SelectedRefiners.push(currentRefiner);
        };

        vm.getSuggestedSearch = function (searchText) {
            return homeService.getSelectedSearches(searchText)
                .then(function (response) {
                    return response.data;
                });
        };

        vm.suggestedOnSelect = function ($item) {
            switch ($item.Group) {
                case 'Related Client':
                    vm.suggestedClientOnSelect($item.Key, constants.RELATEDCLIENT_CLIENTTYPE);
                    break;
                case 'Client ':
                    vm.suggestedClientOnSelect($item.Key, constants.CLIENT_CLIENTTYPE);
                    break;
                default:
                    vm.attorneyOnSelect($item);
            }
        };

        vm.getListOfMetricInfo = function () {
            if (_.any(scope.$parent.metricInfo)) {
                vm.showMetricInfo(scope.$parent.metricInfo);
            }
            else {
                clientService.getMetricInfo()
                   .success(function (data) {
                       scope.$parent.metricInfo = data;
                       vm.showMetricInfo(data);
                   })
                   .error(function (data) {
                       mlb.showToast(data.message);
                   });
            }
        };

        vm.showMetricInfo = function (metricInfo) {
            var modalDefaults = {
                backdrop: true,
                keyboard: true,
                modalFade: true,
                windowClass: "metric-modal",
                templateUrl: 'Common/Views/metricInfo.html'
            };

            modalService.showModal(modalDefaults, {});
        };
    }
    module.controller("ClientCtrl", ["$scope", "Mlb", "homeService", "modalService", "clientService", clientCtrl]);

})(angular.module("pricingCentral"));
