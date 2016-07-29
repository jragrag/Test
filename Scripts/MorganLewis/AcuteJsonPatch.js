var MorganLewis = MorganLewis || {};
MorganLewis.Acute = MorganLewis.Acute || {};
MorganLewis.Acute.Settings = function () {
    this.BindingUsesViewModel = true; //scope uses a view model (vm.property) rather than binding on the property directly
    this.NgRepeatRegex = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)?\s*$/;
}

MorganLewis.Acute.PatchManager = function () {
    this.$get = angular.noop;

    var pm = this;

    pm.items = [];
    pm.count = 0;
    pm.settings = new MorganLewis.Acute.Settings();

    //Takes the current scope, element, and attributes and creates an Acute PatchItem.  If that item already exists the it updates the scope
    pm.add = function (scope, element, attrs) {
        var variables = attrs.patch == "" ? {} : angular.fromJson(attrs.patch);
        if (typeof (variables.track) !== "undefined" && !variables.track)
            return;
        variables.isCollection = (typeof (attrs.ngRepeat) !== "undefined");
        variables.inCollection = (!variables.isCollection && scope.$index > -1);

        var propertyToWatch = getProperty(element); //the key is the path
        var path = buildPath(element, "", []);

        if (!$acuteJsonPatch.items[path]) {
            $acuteJsonPatch.items[path] = new MorganLewis.Acute.PatchItem(pm, scope, element, propertyToWatch, path, variables);
            $acuteJsonPatch.count++;
        }
        else {
            $acuteJsonPatch.items[path].scope = scope;
            $acuteJsonPatch.items[path].watch();
        }
    }

    //generates a json patch document from the Acute PatchItems 
    pm.document = function () {
        if (pm.items == null || pm.count == 0)
            return "";

        var documentItems = [];
        for (var key in pm.items) {
            var patchItems = generatePatchItems(pm.items[key]);

            if (patchItems.length != 0)
                documentItems = documentItems.concat(patchItems)
        }

        if (documentItems.length > 0)
            return "[" + documentItems.join(',') + "]";

        return "";
    }

    //resets all items tracked so that their original values are their new values, and the new value is null
    pm.reset = function () {
        if (pm.items == null || pm.count == 0)
            return;

        for (var key in pm.items) {
            pm.items[key].reset();
        }
    }

    //takes an element and returns the property being tracked 
    function getProperty(element) {
        var property = "";
        if (element[0].hasAttribute("ng-model"))
            property = element.attr("ng-model");
        else if (element[0].hasAttribute("ng-bind"))
            property = element.attr("ng-bind");
        else if (element[0].hasAttribute("ng-repeat")) {
            //http://loring-dodge.azurewebsites.net/re-creating-ng-repeat/ grabbed expression from there
            var match = element.attr("ng-repeat").match(pm.settings.NgRepeatRegex);
            property = match[2];
        }
        else {
            console.error("AcuteJsonError: Cannot track item. No ng-model, ng-bind, or ng-repeat found", element)
        }

        return property;
    }

    //builds the path for a given element and sets patchIdValue
    function buildPath(currentElement, path, ngRepeatScope) {
        //no where left to go up so we clean up the path we generated
        if (currentElement == null || currentElement.length == 0 || currentElement[0].localName == "" || currentElement[0].localName == "body" || currentElement.localName == "html") {
            return pathCleanup(path, ngRepeatScope);
        }

        var currentScope = angular.element(currentElement).scope();

        //hit an ng-bind or ng-model...it's going to be the first input because we shouldn't be nested in one
        if (currentElement[0].hasAttribute("ng-bind") || currentElement[0].hasAttribute("ng-model")) {
            var patchIdValue = getPatchId(currentElement, currentScope);
            var property = getProperty(currentElement);

            if (property.indexOf('.') !== -1) {
                var propertySplit = property.split('.');
                path = (patchIdValue == "" ? "" : patchIdValue + "/") + propertySplit.pop();
                path = propertySplit.join('.') + "/" + path;
            }
            else
                path = (patchIdValue == "" ? "" : patchIdValue + "/") + getProperty(currentElement);
        }
        else if (currentElement[0].hasAttribute("ng-repeat")) {
            //track ng-repeats
            var match = currentElement.attr("ng-repeat").match(pm.settings.NgRepeatRegex);

            if (!ngRepeatScope[match[1]]) {
                var repeatPatchId = getPatchIdProperty(currentElement);
                ngRepeatScope[match[1]] = { collection: match[2], scope: currentScope, patchId: repeatPatchId, index: currentScope.$index };
            }

            //Empty path means the patch directive is on the ng-repeat, so lets grab the collection
            if (path == "") {
                path = match[2];
            }
        }

        return buildPath(currentElement.parent(), path, ngRepeatScope)
    }

    function pathCleanup(path, ngRepeatScope) {
        path = explodeCollectionContexts(path, ngRepeatScope);

        if (path.indexOf('.') !== -1) {
            var splitPath = path.split('.');
            var limit = pm.settings.BindingUsesViewModel ? 1 : 0;
            path = splitPath[splitPath.length - 1];
            for (var i = splitPath.length - 2; i >= limit; i--) {
                path = splitPath[i] + "/" + path;
            }
        }
        else if (pm.settings.BindingUsesViewModel) {
            var splitPath = path.split('/');
            splitPath.shift();
            path = splitPath.join('/');
        }
        return path;
    }

    //takes a path and checks to see if there is a "collection property" in there that needs to be expanded into a proper model property
    function explodeCollectionContexts(path, ngRepeatScope) {
        var splitPath = [path];
        if (path.indexOf('.') !== -1)
            splitPath = path.split('.');
        else if (path.indexOf('/') !== -1)
            splitPath = path.split('/');

        if (splitPath.length > 1) {
            var firstElement = splitPath.shift();
            path = firstElement + '.' + splitPath.join('/');
            splitPath.unshift(firstElement)
        }

        while (ngRepeatScope[splitPath[0]]) {
            var firstElement = splitPath[0];
            if (splitPath.length > 1) {
                splitPath.shift();
                path = splitPath.join('/');
                splitPath.unshift(firstElement)
            }
            else
                path = "";

            if (ngRepeatScope[firstElement]) {
                var patchValue = "";
                if (ngRepeatScope[firstElement].patchId != "") {
                    patchValue = evaluatePatchId(ngRepeatScope[firstElement].patchId, ngRepeatScope[firstElement].scope);
                }
                else {
                    patchValue = ngRepeatScope[firstElement].scope.$index;
                }
                path = ngRepeatScope[firstElement].collection + (patchValue === "" ? "" : "/" + patchValue) + (path == "" ? "" : "/" + path);
            }
            else {
                path = firstElement + (path == "" ? "" : "/" + path);
            }
            splitPath = path.split('.');
        }

        return path;
    }

    //given an element, returns the value of the patchId
    function getPatchId(element, currentScope) {
        var patchIdProperty = getPatchIdProperty(element);
        if (patchIdProperty == "")
            return "";

        if (currentScope == null)
            currentScope = angular.element(element).scope();

        return evaluatePatchId(patchIdProperty, currentScope)
    }

    //given a patchId property and scope, evaluates the value
    function evaluatePatchId(patchIdProperty, currentScope) {
        var patchIdSplit = patchIdProperty.split('.');
        for (var i = 0; i < patchIdSplit.length; i++) {
            currentScope = currentScope[patchIdSplit[i]];
        }
        return currentScope;
    }

    //gets the patchId property out of an element
    function getPatchIdProperty(element) {
        if (!element[0].hasAttribute("patch") || element.attr("patch") == "")
            return "";

        var patchVariables = angular.fromJson(element.attr("patch"));
        if (typeof (patchVariables.patchId) === "undefined")
            return "";

        return patchVariables.patchId;
    }

    //given a AcuteJsonPatchItem generates patch document items
    function generatePatchItems(item) {
        if (item == null)
            return [];

        if (item.isCollection)
            return generateCollectionPatchItems(item);
        else
            return generateNonCollectionPatchItem(item);
    }

    function generateCollectionPatchItems(item) {
        if (item.newValue == null)
            return [];

        if ((item.originalValue == null || item.originalValue.length == 0) && (item.newValue.length == 0))
            return [];

        var patchItems = [];

        //only adding
        if (item.originalValue == null || item.originalValue.length == 0) {
            for (var key in item.newValue) {
                patchItems.push(getPatchItemJson("add", item.path, item.newValue[key]));
            }
        }
            //only removing
        else if (item.newValue.length == 0) {
            for (var key in item.newValue) {
                patchItems.push(getPatchItemJson("remove", item.path + "/" + item.patchIdValue));
            }
        }
        else {
            var addedItems = [];
            var removedItems = [];
            var originalArray = jQuery.extend(true, {}, item.originalValue);
            var trackNewArrayDuplicates = Array.apply(null, Array(Object.keys(item.newValue).length)).map(Boolean.prototype.valueOf, true);
            var trackOriginalArrayRemoveIndex = [];
            var jqueryTools = new MorganLewis.Tools.Json();

            for (var i = 0; i < Object.keys(item.originalValue).length; i++) {
                var originalItemFound = false;
                var originalItemMovedIndex = -1;
                for (var k = 0; k < Object.keys(item.newValue).length; k++) {
                    var originalItemFound = jqueryTools.deepCompare(originalArray[i], item.newValue[k]);
                    if (originalItemFound) {
                        if (i != k)
                            originalItemMovedIndex = k;
                        trackNewArrayDuplicates[k] = false;

                        break;
                    }
                }

                if (!originalItemFound) {
                    removedItems.push(originalArray[i]);
                    trackOriginalArrayRemoveIndex.push(i);
                }
            }

            for (var j = 0; j < trackNewArrayDuplicates.length; j++) {
                if (trackNewArrayDuplicates[j]) {
                    addedItems.push(item.newValue[j]);
                }
            }

            for (var l = 0; l < addedItems.length; l++) {
                patchItems.push(getPatchItemJson("add", item.path, addedItems[l]));
            }

            for (var m = 0; m < removedItems.length; m++) {
                if (item.patchId != "") //TODO: what if no .
                    patchItems.push(getPatchItemJson("remove", item.path + "/" + removedItems[m][item.patchId.split('.').pop()]));
                else
                    patchItems.push(getPatchItemJson("remove", item.path + "/" + trackOriginalArrayRemoveIndex[m]));
            }

            return patchItems;
        }
    }

    function generateNonCollectionPatchItem(item) {
        if (item.newValue == null || item.originalValue == item.newValue)
            return [];

        return getPatchItemJson("replace", item.path, item.newValue);
    }

    function getPatchItemJson(op, path, value) {
        var valueStr = "";
        if (value != null && typeof value === 'string')
            valueStr = value == "" ? "" : ", \"value\" : \"" + value + "\"";
        else if (value != null && typeof value === 'object')
            valueStr = ", \"value\" : " + angular.toJson(value);

        return ["{ \"operation\" : \"" + op + "\", \"path\" : \"" + path + "\"" + valueStr + "}"];
    }
}

MorganLewis.Acute.PatchItem = function (patchManager, scope, element, property, path, variables) {
    var pi = this;
    pi.manager = patchManager;
    pi.element = element;
    pi.scope = scope;
    pi.property = property;
    pi.overriddenModel = "";
    pi.path = path;
    pi.originalValue = null;
    pi.newValue = null;
    pi.watchListener = null;
    pi.patchId = "";
    pi.inCollection = variables.inCollection;
    pi.isCollection = variables.isCollection;

    pi.init = function () {
        if (variables.patchId)
            pi.patchId = variables.patchId;

        if (variables.modelOverride)
            pi.overriddenModel = variables.modelOverride;

        pi.watch();
    }

    pi.watch = function () {
        if (pi.watchListener != null) {
            pi.watchListener();
            pi.watchListener = null;
        }

        if (pi.isCollection) {
            pi.watchListener = pi.scope.$watchCollection(property, function (newValue, oldValue) {
                if (pi.originalValue == null)
                    pi.originalValue = jQuery.extend(true, {}, newValue);
                else
                    pi.newValue = jQuery.extend(true, {}, newValue);
            })
        }
        else {
            pi.watchListener = pi.scope.$watch(property, function (newValue, oldValue) {
                if (pi.originalValue == null)
                    pi.originalValue = newValue;
                else
                    pi.newValue = newValue;
            })
        }
    }

    pi.reset = function () {
        if (pi.newValue != null && pi.newValue != pi.originalValue) {
            pi.originalValue = pi.newValue;
            pi.newValue = null;
        }
    }

    pi.init();
}

var $acuteJsonPatch = new MorganLewis.Acute.PatchManager();
var acuteJsonPatchModule = angular.module('AcuteJsonPatch', []).provider('$acuteJsonPatch', $acuteJsonPatch);

acuteJsonPatchModule.directive("patch", function () {
    function link(scope, element, attrs) {
        if (!attrs.ngBind && !attrs.ngModel && !attrs.ngRepeat)
            throw "patch directive applied to invalid element";

        if (attrs.ngRepeat)
            $acuteJsonPatch.add(scope.$parent, element, attrs);
        else
            $acuteJsonPatch.add(scope, element, attrs);
    }
    return {
        link: link,
        restrict: "A"
    };
});