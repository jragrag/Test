(function (module) {
    "use strict";
    module.config([
            "$httpProvider",
            "$stateProvider",
            "$urlRouterProvider",
            function ($httpProvider, $stateProvider, $urlRouterProvider) {

                //Enable cross domain calls
                $httpProvider.defaults.useXDomain = true;

                //Remove the header used to identify ajax call  that would prevent CORS from working
                delete $httpProvider.defaults.headers.common['X-Requested-With'];
                $urlRouterProvider.otherwise("/");

                $stateProvider
                     .state("home", {
                         url: "/",
                         templateUrl: window.baseUiUrl + "Templates/Home",
                         controller: "HomeCtrl as vm"
                     })
                    .state("relatedclient", {
                        url: "/relatedclient",
                        templateUrl: window.baseUiUrl + "RelatedClient",
                        controller: "RelatedClientCtrl as vm"
                    })
                   .state("client", {
                       url: "/client",
                       templateUrl: window.baseUiUrl + "Client",
                       controller: "ClientCtrl as vm"
                   });
            }
    ])
    .run([
		'$rootScope',
        'userService',
        'constants',
        'ngProgressFactory',
		function ($rootScope, userService, constants, ngProgressFactory) {
		    $rootScope.isLoading = false;
		    $rootScope.constants = constants;
		    $rootScope.metricInfo = {};
		    $rootScope.ngProgress = ngProgressFactory.createInstance();
		    $rootScope.progressBar = function () {
		        return {
		            start: function () {
		                $rootScope.isLoading = true;
		                $rootScope.ngProgress.setColor('#6A287E');
		                $rootScope.ngProgress.start();
		            },
		            complete: function () {
		                $rootScope.ngProgress.complete();
		                $rootScope.isLoading = false;
		            }
		        };

		    };
		    $rootScope.scoped = {
		        format: 'HH:mm:ss'
		    };
		    $rootScope.isEmpty = function (str) {
		        var result = false;
		        if (!(str === undefined)) {
		            result = (!str || 0 === str.length);
		        }
		        return result;
		    };
		    $rootScope.getPracticeGroupUrl = function (practiceGroup) {
		        return String.format(window.practiceGroupUrl, practiceGroup);
		    };
		    $rootScope.getImageUrl = function (filename) {
		        return String.format(window.imageUrl, filename);
		    };
		    $rootScope.getOfficeUrl = function (office) {
		        return String.format(window.officeUrl, office);
		    };
		    $rootScope.getPersonUrl = function (employeeId) {
		        return String.format(window.personUrl, employeeId);
		    };
		    $rootScope.getCallNumberUrl = function (phoneNumber) {
		        if (!(phoneNumber === undefined) && !(phoneNumber === null)) {
		            var callNumber = phoneNumber.indexOf('+') === -1 ? "+" + phoneNumber : phoneNumber;
		            callNumber = callNumber.split(".").join("");
		            return String.format("tel:{0}", callNumber);
		        }
		        return '';
		    };
		    $rootScope.getBillingGuidelinesUrl = function () {
		        return String.format(window.billingGuidelinesUrl);
		    };
		    $rootScope.getMorganViewUrl = function (clientNumber) {
		        return String.format(window.morganViewUrl, clientNumber);
		    };
		    $rootScope.getMorganNetUrl = function (clientNumber, type) {
		        switch (type) {
		            case constants.CLIENT_CLIENTTYPE:
		                return String.format(window.morganNetUrl, 'Client', 'cid=' + clientNumber);
		            case constants.RELATEDCLIENT_CLIENTTYPE:
		                return String.format(window.morganNetUrl, 'RelatedClient', 'rcid=' + clientNumber);
		            default:
		                return '#';

		        }
		    };
		    $rootScope.getCurrentUser = function () {
		        if (typeof ($rootScope.currentUser) === 'undefined') {
		            userService.getCurrentUser()
                        .success(function (data) {
                            if (data) {
                                $rootScope.currentUser = data;
                            }
                        })
                        .error(function (data) {
                            mlb.showToast(data.message);
                        });
		        }
		    };
		}
    ]);

})(angular.module("pricingCentral"));