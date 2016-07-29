(function (module) {
    "use strict";

    function highlight($sce) {
        return function (text, phrase) {
            if (phrase) {
                text = text.replace(new RegExp('(' + phrase.replace(/\./g, '\\.') + ')', 'gi'),
              '<span class="highlighted">$1</span>');
            }
            return $sce.trustAsHtml(text);
        };
    };

    module.filter("highlight", highlight);
})(angular.module("pricingCentral"));
