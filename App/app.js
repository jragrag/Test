(function (module) {
    "use strict";

    function indexCtrl($scope) {
        $scope.init = true;
    }

    module.controller('IndexCtrl', ["$scope", "$window", indexCtrl]);

})(angular.module("pricingCentral", [
            "commonServices",
            "smart-table",
            "ui.router",
            "ngSanitize",
            "ui.bootstrap",
            "homeServices",
            "modalServices",
            "clientServices",
            "relatedClientServices",
            "userServices",
            "AcuteJsonPatch",
            "checklist-model",
            "ngAnimate",
            "infinite-scroll",
            "ngProgress"
]));