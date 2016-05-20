/**
 * @author Vickus van Zyl <vanzylv@gmail.com>
 */

'use strict';

findMeMoviesApp.run(['$anchorScroll', function($anchorScroll) {

        console.log('Done boostrapping');

        $anchorScroll.yOffset = 50; // always scroll by 50 extra pixels*/

    }]).controller('dialogControllerMoreInfoMovie', ['$scope', '$mdDialog', 'itemDetail', function($scope, $mdDialog, itemDetail) {

        $scope.originalTitle = itemDetail.original_title;
        $scope.tagLine = itemDetail.tagline;
        $scope.overview = itemDetail.overview;
        $scope.imdbId = itemDetail.imdb_id;
        $scope.releaseDate = itemDetail.release_date;
        $scope.runtime = itemDetail.runtime;
        $scope.voteAverage = itemDetail.voteAverage;

        $scope.image = $scope.baseImageUrl + $scope.imageW185 + itemDetail.poster_path

        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };

    }])
    .controller('dialogControllerMoreInfoPerson', ['$scope', '$mdDialog', 'itemDetail', function($scope, $mdDialog, itemDetail) {

        $scope.name = itemDetail.name;
        $scope.biography = itemDetail.biography;
        $scope.birthday = itemDetail.birthday;
        $scope.imdbId = itemDetail.imdb_id;
        $scope.placeOfBirth = itemDetail.profile_path;

        $scope.image = $scope.baseImageUrl + $scope.imageW185 + itemDetail.profile_path;

        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };

    }]).controller('searchCtr', ['$scope', '$mdSidenav', '$mdDialog', 'movieDBService',
        function($scope, $mdSidenav, $mdDialog, movieDBService) {

            $scope.sideBarItems = [];
            $scope.contentItems = [];
            $scope.baseImageUrl, $scope.imageW45, $scope.imageW300, $scope.imageW92, $scope.imageW154, $scope.imageW185, $scope.imageW500;

            movieDBService.logAPIConfig().then(function(config) {
                $scope.imageW45 = config.data.images.logo_sizes[0];
                $scope.imageW92 = config.data.images.logo_sizes[1];
                $scope.imageW154 = config.data.images.logo_sizes[2];
                $scope.imageW185 = config.data.images.logo_sizes[3];
                $scope.imageW300 = config.data.images.logo_sizes[4];
                $scope.imageW500 = config.data.images.logo_sizes[5];
                $scope.baseImageUrl = config.data.images.base_url;
            });

            //Initial state of side panel
            $scope.searchPanelUI = {
                showSeachTip: true,
                showHints: true,
                searchString: ''
            };


            //Display detailed description of selected item in popup dialog
            $scope.showItemInfoDialog = function(item, ev) {

                console.log('Media type for popup : ', item.mediaType)

                if (item.mediaType === 'movie') {

                    //Find and display detailed movie information

                    movieDBService.findMovie(item.id).then(function(movieInformation) {
                        console.log('movie info', movieInformation);
                        $mdDialog.show({
                            controller: 'dialogControllerMoreInfoMovie',
                            templateUrl: 'main/templates/moreinfo-movie.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: true,
                            resolve: {
                                itemDetail: function() {
                                    return movieInformation;
                                }
                            },
                            scope: $scope
                        }).then(function(answer) {
                            //$scope.status = 'You said the information was "' + answer + '".';
                        }, function() {
                            //$scope.status = 'You cancelled the dialog.';
                        });

                    });

                } else {
                    //Find and display detailed person information


                    movieDBService.findPerson(item.id).then(function(personInformation) {
                        console.log('person Information', personInformation);

                        $mdDialog.show({
                            controller: 'dialogControllerMoreInfoPerson',
                            templateUrl: 'main/templates/moreinfo-person.tmpl.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: true,
                            resolve: {
                                itemDetail: function() {
                                    return personInformation;
                                }
                            },
                            scope: $scope
                        }).then(function(answer) {
                            //$scope.status = 'You said the information was "' + answer + '".';
                        }, function() {
                            //$scope.status = 'You cancelled the dialog.';
                        });

                    })
                }

            }

            //Do initial search for movie / person
            $scope.fuzzySearch = function(event) {

                console.log('fuzzy search start');

                //on enter key press
                if (event.which === 13) {

                    console.log('fuzzy search string', $scope.searchPanelUI.searchString);

                    //1.Clear exsisting history and right panel content if exists
                    clearSideBarItems();
                    clearContentItems();

                    //2.Do remote call to search
                    movieDBService.search($scope.searchPanelUI.searchString).then(function(searchResults) {

                        //Add results to grid
                        
                        populateGrid(searchResults);
                    });

                    pushToSideBarList({
                        title: $scope.searchPanelUI.searchString,
                        image: '/assets/images/search.png'
                    });

                }
            }


            var populateGrid = function(results) {

                _.each(results, function(resultItem) {
                    var normalizedResult = normalizeSearchResults(resultItem);
                    normalizedResult.displayAsResultType = true;
                    $scope.contentItems.push(normalizedResult);
                });
            }

            var pushToSideBarList = function(newSideBarItem) {

                $scope.sideBarItems.push(newSideBarItem);

            }

            var clearSideBarItems = function() {

                console.log('Clear sidebar items');
                $scope.sideBarItems = [];

            }

            var clearContentItems = function() {

                console.log('Clear content items');
                $scope.contentItems = [];
            }


            //normalize object to conform to the tile model
            var normalizeSearchResults = function(item) {

                var result = {};
                var mediaType = !item.hasOwnProperty('media_type') ? 'movie' : item.media_type;

                var image = mediaType === 'person' ? item.profile_path : item.poster_path;
                if (typeof image == 'undefined') {
                    imagePath = '';
                }

                if (mediaType === 'person') {
                    result.title = item.name;
                } else if (mediaType === 'movie') {
                    result.title = item.title;
                }

                result.id = item.id;
                result.resultTypeIcon = mediaType === 'movie' ? 'movie' : 'account_circle'
                result.image = $scope.baseImageUrl + $scope.imageW185 + image;
                result.mediaType = mediaType;
                result.cols = 1;
                result.rows = 5;

                return result;

            }

            //load related items
            $scope.getRelatedItems = function(item) {

                pushToSideBarList({
                    title: item.title,
                    image: item.image
                });

                clearContentItems();
                console.log('clicked on ', item.mediaType)

                if (item.mediaType === 'movie') {

                    movieDBService.findMovieInfo(item.id).then(function(serviceResults) {

                        var categories = ['actors', 'directors', 'producers'];
                        var resultsToGrid = [];

                        _.each(categories, function(categoryKey) {

                            var friendlyCategoryName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

                            if (serviceResults[categoryKey].length > 0) {
                                resultsToGrid.push({
                                    displayAsCategory: true,
                                    title: friendlyCategoryName,
                                    cols: 4,
                                    rows: 1
                                });
                            }

                            _.each(serviceResults[categoryKey], function(resultCategory) {

                                var image;

                                if (!resultCategory.profile_path) {
                                    image = '../assets/images/no-profile.jpg';
                                } else {
                                    image = $scope.baseImageUrl + $scope.imageW185 + resultCategory.profile_path;
                                }

                                resultsToGrid.push({
                                    id: resultCategory.id,
                                    title: resultCategory.name,
                                    image: image,
                                    resultTypeIcon: 'account_circle',
                                    cols: 1,
                                    rows: 5,
                                    mediaType: 'person'
                                });

                            });

                        });

                        $scope.contentItems = resultsToGrid;

                    });

                } else {
                    movieDBService.findPersonInfo(item.id).then(function(serviceResults) {

                        var categories = ['asActor', 'asDirector', 'asProducer'];
                        var resultsToGrid = [];

                        _.each(categories, function(categoryKey) {

                            var friendlyName = 'As ' + categoryKey.substr(2, categoryKey.length).toLowerCase();

                            if (serviceResults[categoryKey].length > 0) {
                                resultsToGrid.push({
                                    displayAsCategory: true,
                                    title: friendlyName,
                                    cols: 4,
                                    rows: 1
                                });
                            }

                            _.each(serviceResults[categoryKey], function(resultCategory) {

                                var image;

                                if (!resultCategory.poster_path) {
                                    image = '../assets/images/no-profile.jpg';
                                } else {
                                    image = $scope.baseImageUrl + $scope.imageW185 + resultCategory.poster_path
                                }

                                resultsToGrid.push({
                                    id: resultCategory.id,
                                    title: resultCategory.title,
                                    image: image,
                                    resultTypeIcon: 'movie',
                                    cols: 1,
                                    rows: 5,
                                    mediaType: 'movie'
                                });

                            });

                        });

                        $scope.contentItems = resultsToGrid;

                    });
                }

            };

        }
    ]);


findMeMoviesApp.directive('backImg', function() {

    return function(scope, element, attrs) {

        var url = attrs.backImg;

        element.css({
            'background-image': 'url(' + url + ')',
            'background-size': 'cover'
        });

    };
});

