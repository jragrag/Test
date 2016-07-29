(function (module) {
    "use strict";

    function onErrorSrc() {
        return {
            link: function (scope, element, attrs) {
                element.bind('error', function () {
                    if (attrs.src !== attrs.onErrorSrc) {
                        attrs.$set('src', attrs.onErrorSrc);
                    }
                });

                element.bind('load', function () {
                    angular.element(element).removeClass('image-replacement');
                });
            }
        };


    };

    function showDetailsLink($timeout) {
        return {
            link: function (scope, element) {
                var getHeight = function () {

                    var clampParagraph = element.children()[0];
                    var fullParagraph = element.children()[1];
                    var getClampHeight = angular.element(clampParagraph).prop('offsetHeight');
                    var getFullHeight = angular.element(fullParagraph).prop('offsetHeight');
                    scope.showDetail = getFullHeight > getClampHeight;
                };
                $timeout(getHeight, 0);
            }
        };
    };

    function pgClamp($timeout, $clamp) {
        return {
            link: link
        };

        function link(scope, element, attrs) {
            var line = parseInt(attrs.pgClamp, 10);

            if (attrs.ngBind) {
                scope.$watch(attrs.ngBind, doClamp);
            }

            doClamp();

            function doClamp() {
                $timeout(function () {
                    $clamp(element[0], { clamp: line });
                }, 0, false);
            }
        }
    };

    module.constant('$clamp', $clamp);
    module.directive("pgClamp", pgClamp);
    module.directive("onErrorSrc", onErrorSrc);
    module.directive("showDetailsLink", showDetailsLink);
})(angular.module("pricingCentral"));
