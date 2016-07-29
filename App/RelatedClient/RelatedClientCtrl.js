(function (module) {
    "use strict";

    function relatedClientCtrl($scope, mlb, homeService, relatedClientService, clientService, modalService) {

        var vm = this;
        var scope = $scope;
        var parentScope = scope.$parent;
        var constants = parentScope.constants;        

        vm.getClient = function () {
            if (typeof (scope.selectedClientNumber) === 'undefined') {
                mlb.redirect("home");
            }
            parentScope.progressBar().start();
            homeService.getRelatedClient(scope.selectedClientNumber)
                .success(function (result) {
                    scope.client = result;
                    scope.pricingIdNumbers = _.uniq(_.map(scope.client.PricingDetail, function (item) {                        
                        return {
                            PricingIdNumber: item.PricingIdNumber,
                            AgreementText: item.AgreementText,
                            ClientCount: item.ClientCount                                
                        };
                    }), function (item) {
                        return item.PricingIdNumber;
                    });                   

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

        vm.getClientCount = function (count) {
            return String.format('{0} Client{1}', count, count > 1 ? 's' : '');
        };

        vm.createPdfVersion = function () {
            var linkUrl = String.format('{0}/api/generateRelatedClientPdf/{1}', window.baseApiUrl, scope.client.RelatedClientNumber);
            window.location.href = linkUrl;
        };

        vm.searchOnClick = function (searchText) {
            if (scope.searchText.length < 3 && scope.searchText.length !== 0) {
                scope.isNoResult = true;
                scope.resultMessage = 'Search term must be a minimum of 3 characters.';
                return false;
            }
            else {
                scope.isNoResult = false;
                scope.$parent.prevState = "relatedclient";
                scope.searchParameters.SelectedTab = "A";
                scope.searchParameters.SearchText = searchText;
                scope.searchParameters.SuggestedSearchItem = null;
                vm.setDefaultRefiner();
                scope.$parent.searchParameters = scope.searchParameters;
                mlb.redirect("home");
            }
        };

        vm.backToSearchResults = function () {
            scope.$parent.prevState = "relatedclient";
            scope.$parent.searchParameters = scope.searchParameters;
            mlb.redirect("home");
        };

        vm.searchClientByAttorney = function (attorney) {
            scope.$parent.prevState = "relatedclient";
            scope.searchParameters.SearchText = null;
            scope.searchParameters.SelectedTab = constants.CLIENT_CLIENTTYPE;
            scope.searchParameters.SuggestedSearchItem = null;
            scope.searchParameters.SelectedRefiners = attorney.Refiners;
            scope.$parent.searchParameters = scope.searchParameters;
            mlb.redirect("home");
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
                    mlb.redirect("client");
                    break;
                case constants.RELATEDCLIENT_CLIENTTYPE:
                    vm.getClient();
                    break;
                default:
                    mlb.redirect("home");
            }
        };

        vm.attorneyOnSelect = function (attorney) {
            scope.searchParameters.SearchText = null;
            scope.searchParameters.SuggestedSearchItem = attorney;
            scope.searchParameters.SelectedTab = "A";
            vm.setDefaultRefiner();
            scope.$parent.searchParameters = scope.searchParameters;
            scope.$parent.prevState = "relatedclient";
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

    module.controller("RelatedClientCtrl", ["$scope", "Mlb", "homeService", "relatedClientService", "clientService", "modalService", relatedClientCtrl]);
})(angular.module("pricingCentral"));
