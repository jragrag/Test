(function (module) {
    function mlb(catalogService, $state) {
        var me = {};
        if (!String.fortmat) {
            String.format = function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] !== 'undefined'
                        ? args[number]
                        : match;
                });
            };
        }
        /**
         * gets desired param from url
         * @param {} url
         * @param {} param
         * @returns {}
         */
        me.getParameterByName = function (url, param) {
            var a = url.split("?")[1].split("&");
            if (a === "") {
                return {};
            }
            var b = {};
            for (var i = 0; i < a.length; ++i) {
                var p = a[i].split('=', 2);
                if (p.length === 1)
                    b[p[0]] = "";
                else
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b[param];
        },
        /**
         * gets timezone for date passed or if no date is passed
         * it uses "now"
         *
         * @param {Date Object} date
         * @returns {String} 
         */
        me.getTimeZone = function (date) {
            if (!date) {
                date = new Date();
            }
            var timeStr = date.toTimeString();
            return timeStr.slice(9, timeStr.length);
        },

        /**
         * redirect to different state
         * @param {String} state
         */
        me.redirect = function (state) {
            $state.go(state);
        },
        /**
         * launches a new window with the inner html of the supplied div.id
         * @param {String} divName
         * @returns {boolean}
         */
        me.printPreview = function (divId) {

            var printContents = document.getElementById(divId).innerHTML,
                popupWin;

            if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                popupWin = window.open('', '_blank');
                popupWin.window.focus();
                popupWin.document.write(String.format('<!DOCTYPE html><html><head>' +
                    '<link href="{0}Content/Site.css" rel="stylesheet" />' +
                    '<link href="{0}Content/bootstrap.css" rel="stylesheet" />' +
                    '<link href="{0}Content/angular-material/angular-material.css" rel="stylesheet" />' +
                    '</head><body>{1}</body></html>', window.baseUiUrl, printContents));
            } else {
                popupWin = window.open('', '_blank');
                popupWin.document.open();
                popupWin.document.write(String.format('<!DOCTYPE html><html><head>' +
                    '<link href="{0}Content/Site.css" rel="stylesheet" />' +
                    '<link href="{0}Content/bootstrap.css" rel="stylesheet" />' +
                    '<link href="{0}Content/angular-material/angular-material.css" rel="stylesheet" />' +
                    '</head><body>{1}</body></html>', window.baseUiUrl, printContents));
            }

            return true;
        },
        me.showToast = function () {
            //$mdToast.show(
            //           $mdToast.simple()
            //           .content(message)
            //           .position('top right')
            //           .hideDelay(3000));
        }
        return me;
    };

    module.factory("Mlb", ["lookupService", "$state", mlb]);
})(angular.module("pricingCentral"));