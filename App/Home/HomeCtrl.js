(function (module) {
    "use strict";

    function homeCtrl($scope, $parse, mlb, homeService, modalService) {
        var vm = this;
        var scope = $scope;
        var parentScope = scope.$parent;
        var constants = parentScope.constants;

        scope.searchText = '';
        scope.isPracticeGroupLoaded = false;
        scope.isIndustryLoaded = false;
        scope.isSectorLoaded = false;
        scope.isStatusLoaded = false;

        vm.initilizePage = function () {
            scope.isNoResult = false;
            scope.hasResults = false;
            scope.lazyResults = [];
            scope.Results = [];
            scope.RelatedClientResults = [];
            scope.ClientResults = [];
            scope.defaultRefiners = [{ Key: constants.CURRENT, Name: constants.CURRENT, Group: constants.STATUS_REFINERGROUP }];
                        
            switch (scope.prevState) {
                case 'relatedclient':
                case 'client':
                    scope.isPracticeGroupLoaded = true;
                    scope.isIndustryLoaded = true;
                    scope.isSectorLoaded = true;
                    scope.isStatusLoaded = true;
                    vm.setSearchParameters(scope.searchParameters);
                    vm.getSearchResults(scope.searchParameters);                                        

                    scope.$parent.prevState = "";
                    break;
                default:                                        
                    vm.setToDefaultFilters();                                     
            }

        };

        vm.getAllDefaultFilter = function () {
            scope.isNoResult = false;
            scope.hasResults = false;
            scope.Results = [];
            scope.RelatedClientResults = [];
            scope.ClientResults = [];
            scope.selectedRefiners = angular.copy(scope.defaultRefiners);
        };

        vm.searchOnClick = function (searchText) {
            scope.currenSearchText = typeof (searchText) === 'undefined' ? '' : _.any(searchText) ? searchText : '';
            scope.SuggestedSearchItem = null;
            if (scope.currenSearchText.length < 3 && scope.currenSearchText.length !== 0) {
                scope.hasResults = false;
                scope.isNoResult = true;
                scope.resultMessage = 'Search term must be a minimum of 3 characters.';
                scope.Results = [];
                scope.lazyResults = [];
                scope.RelatedClientResults = [];
                scope.ClientResults = [];
                vm.filterTabChanged(scope.selectedTab);
            }
            else {
                scope.isPracticeGroupLoaded = true;
                scope.isIndustryLoaded = true;
                scope.isSectorLoaded = true;
                scope.isStatusLoaded = true;
                var param = vm.getSearchParameters();
                vm.getSearchResults(param);
            }
        };

        vm.attorneyOnSelect = function (attorney) {
            scope.searchText = '';
            scope.currenSearchText = '';
            scope.SuggestedSearchItem = attorney;
            var param = vm.getSearchParameters();
            vm.getSearchResults(param);
        };

        vm.refinerSearch = function () {
            if (scope.hasResults) {
                var param = vm.getSearchParameters();
                vm.getSearchResults(param);
            }
        };

        vm.getSearchResults = function (param) {
            
            parentScope.progressBar().start();
            homeService.getSearchResults(param)
                .success(function (data) {
                    scope.hasResults = _.any(data.SearchResults);
                    if (scope.hasResults) {
                        scope.isNoResult = false;
                        scope.Results = data.SearchResults;
                        scope.Refiners = data.Refiners;
                        scope.ClientResults = _.where(angular.copy(scope.Results), { Type: constants.CLIENT_CLIENTTYPE });
                        scope.RelatedClientResults = _.where(angular.copy(scope.Results), { Type: constants.RELATEDCLIENT_CLIENTTYPE });
                        scope.lazyResults = angular.copy(scope.Results).splice(0, 20);

                        scope.isPracticeGroupLoaded = true;
                        scope.isIndustryLoaded = true;
                        scope.isSectorLoaded = true;
                        scope.isStatusLoaded = true;
                    }
                    else {
                        scope.isNoResult = true;
                        scope.Results = [];
                        scope.RelatedClientResults = [];
                        scope.ClientResults = [];
                        scope.lazyResults = [];
                        if (!_.any(scope.selectedRefiners)) {
                            scope.selectedRefiners = angular.copy(scope.defaultRefiners);
                        }

                        if (typeof (scope.Refiners) === 'undefined' || scope.Refiners.length === 0) {
                            if (typeof (scope.DefautRefiners) !== 'undefined' && scope.DefautRefiners.length > 0) {
                                scope.Refiners = scope.DefautRefiners;
                            }
                            else {
                                vm.getAllDefaultFilter();
                            }                            
                        }

                        scope.resultMessage = "No records were found that match the criteria you provided. Please try another search.";
                    }
                    vm.setSearchParameters(param);
                    vm.filterTabChanged(param.SelectedTab);
                })
                .error(function (data) {
                    mlb.showToast(data.message);
                })
                .then(function () {
                    parentScope.progressBar().complete();
                });
        };

        vm.getSuggestedSearches = function (searchText) {

            return homeService.getSelectedSearches(searchText)
                     .then(function (response) {
                         return response.data;
                     });

        };

        vm.initTabs = function () {
            scope.selectedTab = 'A';
            scope.isAllTab = true;
            scope.isRelatedClientTab = false;
            scope.isClientTab = false;
            scope.isNoResult = false;
            scope.hasResults = false;
            scope.showSuggested = false;

        };

        vm.getSearchParameters = function () {

            var param = {
                UserKey: scope.userKey,
                ActiveDirectoryLogin: scope.currentUser,
                SearchText: scope.currenSearchText,
                SelectedRefiners: scope.selectedRefiners,
                SelectedTab: scope.selectedTab,
                SuggestedSearchItem: scope.SuggestedSearchItem
            };

            return param;

        };

        vm.setSearchParameters = function (param) {
            scope.userKey = param.UserKey;
            scope.activeDirectoryLogin = param.ActiveDirectoryLogin;
            scope.searchText = param.SearchText;
            scope.currenSearchText = param.SearchText;;
            scope.selectedRefiners = param.SelectedRefiners;
            scope.selectedTab = param.SelectedTab;
            scope.SuggestedSearchItem = param.SuggestedSearchItem;
        };

        vm.filterTabChanged = function (tabCode) {
            if (scope.hasResults) {
                switch (tabCode) {
                    case constants.RELATEDCLIENT_CLIENTTYPE:
                        var relatedClientCount = vm.recordCount(constants.RELATEDCLIENT_CLIENTTYPE);
                        scope.isAllTab = relatedClientCount === 0;
                        scope.isRelatedClientTab = relatedClientCount > 0;
                        scope.isClientTab = false;
                        break;
                    case constants.CLIENT_CLIENTTYPE:
                        var clientCount = vm.recordCount(constants.CLIENT_CLIENTTYPE);
                        scope.isAllTab = clientCount === 0;
                        scope.isRelatedClientTab = false;
                        scope.isClientTab = clientCount > 0;
                        break;
                    default:
                        scope.isAllTab = true;
                        scope.isRelatedClientTab = false;
                        scope.isClientTab = false;
                }
                scope.selectedTab = scope.isAllTab ? 'A' : tabCode;
                vm.loadInitialCards(scope.selectedTab);
            }

        };

        vm.loadInitialCards = function (tabCode) {
            switch (tabCode) {
                case constants.RELATEDCLIENT_CLIENTTYPE:
                    scope.lazyResults = angular.copy(scope.RelatedClientResults).splice(0, 20);
                    break;
                case constants.CLIENT_CLIENTTYPE:
                    scope.lazyResults = angular.copy(scope.ClientResults).splice(0, 20);
                    break;
                default:
                    scope.lazyResults = angular.copy(scope.Results).splice(0, 20);
            }
        }

        vm.getResultCount = function () {
            var resultCount;
            if (scope.isRelatedClientTab) {
                resultCount = vm.recordCount(constants.RELATEDCLIENT_CLIENTTYPE);
            }
            else if (scope.isClientTab) {
                resultCount = vm.recordCount(constants.CLIENT_CLIENTTYPE);
            }
            else {
                resultCount = vm.recordCount();
            }

            return (resultCount > 0 ? resultCount + (resultCount > 1 ? " Results" : " Result") : "");
        };

        vm.clearRefinerGroup = function (group) {
            scope.selectedRefiners = _.reject(scope.selectedRefiners, function (item) {
                return item.Group === group;
            });

            scope.Refiners = _.map(scope.Refiners, function (item) {
                return {
                    Key: item.Key,
                    Name: item.Name,
                    Group: item.Group,
                    Count: item.Count,
                    IsSelected: item.Group === group ? false : item.IsSelected
                }
            });

            vm.refinerSearch();
        };

        vm.refinersOnChange = function (item) {            
            if (item.IsSelected) {
                scope.selectedRefiners.push(item);
            } else {
                scope.selectedRefiners = _.reject(scope.selectedRefiners, function (data) {
                    return data.Group === item.Group && data.Key === item.Key;
                })
            }          
            vm.refinerSearch();
        };

        vm.refinerStatusChanged = function (item) {
            var status = _.find(scope.Refiners, function (stat) {
                return stat.Group === constants.STATUS_REFINERGROUP && stat.Name === item;
            })
            scope.selectedRefiners = _.reject(scope.selectedRefiners, function (selectedItem) {
                return selectedItem.Group === status.Group;
            });
            scope.selectedRefiners.push(status);
            vm.refinerSearch();
        };
        
        vm.resetFilters = function () {

            scope.selectedRefiners = angular.copy(scope.defaultRefiners);
            scope.searchText = '';
            scope.currenSearchText = '';
            scope.selectedTab = 'A';
            scope.SuggestedSearchItem = null;
            scope.isNoResult = false;
            scope.Results = [];
            scope.hasResults = false;
            scope.lazyResults = [];
            scope.Results = [];
            scope.RelatedClientResults = [];
            scope.ClientResults = [];
            scope.isCollapsedRelatedClient = false;
            scope.isCollapsedClient = false;
            scope.isCollapsedCoordinatingRA = false;
            scope.isCollapsedResponsibleAttorney = false;
            scope.isCollapsedPracticeGroup = false;
            scope.isCollapsedIndustry = false;
            scope.isCollapsedSector = false;
            scope.isCollapsedStatus = false;

            scope.Refiners = [],
            scope.isPracticeGroupLoaded = false;
            scope.isIndustryLoaded = false;
            scope.isSectorLoaded = false;
            scope.isStatusLoaded = false;
            scope.selectedStatus = [];
            scope.selectedStatus = _.first(scope.defaultRefiners).Name;            
        };

        vm.getClient = function (clientNumber, type) {
            scope.$parent.selectedClientNumber = clientNumber;
            scope.$parent.searchParameters = vm.getSearchParameters();
            parentScope.progressBar().start();
            switch (type) {
                case constants.CLIENT_CLIENTTYPE:
                    mlb.redirect("client");
                    break;
                case constants.RELATEDCLIENT_CLIENTTYPE:
                    mlb.redirect("relatedclient");
                    break;
                default:
                    mlb.redirect("home");
            }
        };

        vm.refinerGroups = function () {
            return _.uniq(_.pluck(scope.selectedRefiners, 'Group'));
        };

        vm.removeFilter = function (selectedItem) {
            scope.selectedRefiners = _.reject(scope.selectedRefiners, function (item) {
                return item.Name === selectedItem.Name && item.Key === selectedItem.Key && item.Group === selectedItem.Group;
            });

            scope.Refiners = _.map(scope.Refiners, function (item) {
                return {
                    Key: item.Key,
                    Name: item.Name,
                    Group: item.Group,
                    Count: item.Count,
                    IsSelected: item.Key === selectedItem.Key && item.Group === selectedItem.Group ? false : item.IsSelected
                }
            });

            if (selectedItem.Group === constants.STATUS_REFINERGROUP) {
                scope.selectedStatus = [];
            }            

            vm.refinerSearch();
        };

        vm.removeDuplicate = function (data) {
            return _.uniq(data, function (item) {
                return item.Name;
            });
        };

        vm.filterData = function (data, searchText) {
            return _.filter(data, function (item) {
                var result;
                switch (item.Group) {
                    case constants.COORDINATINGRA_REFINERGROUP:
                    case constants.RESPONSIBLEATTORNEY_REFINERGROUP:
                        result = angular.lowercase(item.Name).indexOf(angular.lowercase(searchText)) >= 0;
                        break;
                    default:
                        result = angular.lowercase(item.Name).indexOf(angular.lowercase(searchText)) === 0;

                }
                return result;
            }).slice(0, 5);
        };

        vm.getDataFromResult = function (group) {
            var data;
            switch (group) {
                case constants.STATUS_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(scope.Results, function (item) {
                        return {
                            Key: item.Status,
                            Name: item.Status,
                            Group: constants.STATUS_REFINERGROUP
                        };
                    }));
                    break;
                case constants.RELATEDCLIENT_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(_.where(scope.Results, { Type: constants.RELATEDCLIENT_CLIENTTYPE }), function (item) {
                        return {
                            Key: item.ClientNumber,
                            Name: item.ClientName,
                            Group: constants.RELATEDCLIENT_REFINERGROUP
                        };
                    }));
                    break;
                case constants.RESPONSIBLEATTORNEY_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(_.pluck(_.where(scope.Results, { Type: constants.CLIENT_CLIENTTYPE }), 'Attorney'), function (item) {
                        return {
                            Key: item.EmployeeId,
                            Name: item.NameDisplay,
                            Group: constants.RESPONSIBLEATTORNEY_REFINERGROUP
                        };
                    }));
                    break;
                case constants.COORDINATINGRA_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(_.pluck(_.where(scope.Results, { Type: constants.RELATEDCLIENT_CLIENTTYPE }), 'Attorney'), function (item) {
                        return {
                            Key: item.EmployeeId,
                            Name: item.NameDisplay,
                            Group: constants.COORDINATINGRA_REFINERGROUP
                        };
                    }));
                    break;
                case constants.PRACTICEGROUP_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(_.pluck(_.pluck(scope.Results, 'Attorney'), 'PracticeGroup'), function (item) {
                        return {
                            Key: item.PracticeGroupCode,
                            Name: item.PracticeGroupName,
                            Group: constants.PRACTICEGROUP_REFINERGROUP
                        };
                    }));
                    break;
                case constants.INDUSTRY_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(_.where(scope.Results, { Type: constants.CLIENT_CLIENTTYPE }), function (item) {
                        return {
                            Key: item.IndustryDescription,
                            Name: item.IndustryDescription,
                            Group: constants.INDUSTRY_REFINERGROUP
                        };
                    }));
                    break;
                case constants.SECTOR_REFINERGROUP:
                    data = vm.removeDuplicate(_.map(_.where(scope.Results, { Type: constants.CLIENT_CLIENTTYPE }), function (item) {
                        return {
                            Key: item.SegmentDescription,
                            Name: item.SegmentDescription,
                            Group: constants.SECTOR_REFINERGROUP
                        };
                    }));
                    break;
                default:
                    data = vm.removeDuplicate(_.map(_.where(scope.Results, { Type: constants.CLIENT_CLIENTTYPE }), function (item) {
                        return {
                            Key: item.ClientNumber,
                            Name: item.ClientName,
                            Group: constants.CLIENT_REFINERGROUP
                        };
                    }));

            }
            return data;
        };

        vm.suggestedClientOnSelect = function (clientNumber, type) {
            scope.searchText = '';
            scope.currenSearchText = '';
            vm.getClient(clientNumber, type);
        };

        vm.suggestedOnSelect = function ($item) {
            switch ($item.Group) {
                case 'Related Client':
                    vm.getClient($item.Key, constants.RELATEDCLIENT_CLIENTTYPE);
                    break;
                case 'Client ':
                    vm.getClient($item.Key, constants.CLIENT_CLIENTTYPE);
                    break;
                default:
                    vm.attorneyOnSelect($item);
            }
        };

        vm.setToDefaultFilters = function () {            
            homeService.getUserDefaultFilter(scope.currentUser)
                .success(function (data) {
                    if (data !== null) {
                        var param = angular.fromJson(data.SearchCriteriaDefaultCode, false);
                        param.UserKey = data.UserKey;
                        vm.setSearchParameters(param);
                        vm.getSearchResults(param);
                        
                        scope.selectedStatus = _.find(scope.selectedRefiners, function (data) {
                            return data.Group === constants.STATUS_REFINERGROUP;
                        }).Name;
                    }
                    else {
                        vm.getAllDefaultFilter();
                    }
                })
                .error(function () {
                    vm.getAllDefaultFilter();
                });
        };

        vm.autocompleteSource = function (searchText, refinerGroup) {
            if (scope.hasResults && (_.any(scope.searchText) || _.any(_.reject(scope.selectedRefiners, function (item) {
                return item.Group === constants.STATUS_REFINERGROUP;
            })))) {
                return vm.filterData(vm.getDataFromResult(refinerGroup), searchText);
            } else {
                if (typeof (searchText) !== 'undefined' && _.any(searchText)) {
                    var param = vm.getSearchParameters();
                    param.IsAutocomplete = true;
                    param.IsCascade = scope.hasResults;
                    param.SearchText = searchText;
                    return homeService.getRefinerAutocompletes(param, refinerGroup).then(function (data) {
                        return data.data;
                    });
                } else {
                    return [];
                }
            }
        };

        vm.filterSource = function (group) {
            var listName = "is" + group.replace(/[\s]/g, '') + "Loaded";
            if (!scope[listName]) {
                var refinerName = "is" + group.replace(/[\s]/g, '') + "Loading";
                var loadingParam = refinerName;
                var lodingModel = $parse(loadingParam);
                lodingModel.assign(scope, true);
                homeService.getRefinerSource(group)
                       .success(function (data) {
                           if (data) {
                               scope.Refiners = _.union(scope.Refiners, data)
                               scope.$parent.DefautRefiners = angular.copy(scope.Refiners);
                               var loadParam = listName;
                               var model = $parse(loadParam);
                               model.assign(scope, true);
                           }
                       })
                       .error(function (data) {
                           mlb.showToast(data.message);
                           scope.$parent.isLoading = false;
                       })
                       .then(function () {
                           lodingModel.assign(scope, false);
                       });
            }
        };

        vm.clearSelectedAutocomplete = function (refinerGroup) {

            switch (refinerGroup) {
                case constants.RELATEDCLIENT_REFINERGROUP:
                    scope.relatedClientSearchText = '';
                    break;
                case constants.COORDINATINGRA_REFINERGROUP:
                    scope.coordinatingRASearchText = '';
                    break;
                case constants.RESPONSIBLEATTORNEY_REFINERGROUP:
                    scope.responsibleAttorneySearchText = '';
                    break;                                
                default:
                    scope.clientSearchText = '';
            }
        };

        vm.selectedItemChanged = function (selectedItem) {
            if (!_.any(scope.selectedRefiners, function (item) {
                return item.Name === selectedItem.Name && item.Key === selectedItem.Key && item.Group === selectedItem.Group;
            })) {
                scope.selectedRefiners.push(selectedItem);
                vm.refinerSearch();
            }
            vm.clearSelectedAutocomplete(selectedItem.Group);
            vm.refinerSearch();
        };

        vm.saveAsDefaultFilters = function () {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Ok',
                headerText: 'Save As Default',
                bodyText: 'Overwrite current defaults?'
            };

            modalService.showModal({}, modalOptions).then(function () {
                scope.$parent.isLoading = true;
                var param = vm.getSearchParameters();
                homeService.saveUserDefaultFilter(param)
                    .success(function (data) {
                        scope.$parent.isLoading = false;
                        scope.userKey = data.UserKey;
                    })
                    .error(function (data) {
                        scope.$parent.isLoading = false;
                        mlb.showToast(data.message);
                    });
            });
        };

        vm.loadMoreCards = function () {
            var last = scope.lazyResults.length;
            var cardsPerScroll = 10;
            switch (scope.selectedTab) {
                case constants.CLIENT_CLIENTTYPE:
                    scope.lazyResults = _.union(scope.lazyResults, angular.copy(scope.ClientResults).splice(last, cardsPerScroll));
                    break;
                case constants.RELATEDCLIENT_CLIENTTYPE:
                    scope.lazyResults = _.union(scope.lazyResults, angular.copy(scope.RelatedClientResults).splice(last, cardsPerScroll));
                    break;
                default:
                    scope.lazyResults = _.union(scope.lazyResults, angular.copy(scope.Results).splice(last, cardsPerScroll));
            }
        };

        vm.recordCount = function (clientType) {
            var count;
            switch (clientType) {
                case constants.RELATEDCLIENT_CLIENTTYPE:
                    count = _.size(_.where(scope.Results, { Type: constants.RELATEDCLIENT_CLIENTTYPE }));
                    break;
                case constants.CLIENT_CLIENTTYPE:
                    count = _.size(_.where(scope.Results, { Type: constants.CLIENT_CLIENTTYPE }));
                    break;
                default:
                    count = _.size(scope.Results);
                    break;
            }
            return count;
        };

        vm.showAgreementPerformance = function (row) {
            homeService.getMetrics(row.ClientNumber, row.Type)
                    .success(function (data) {
                        row.PerformanceMetrics = data;
                    })
                    .error(function (data) {
                        row.PerformanceMetrics = [];
                        mlb.showToast(data.message);
                    });
        };


    }

    module.controller("HomeCtrl", ["$scope", "$parse", "Mlb", "homeService", "modalService", homeCtrl]);

})(angular.module("pricingCentral"));
