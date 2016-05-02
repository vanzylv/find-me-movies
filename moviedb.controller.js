findMeMoviesApp.run(['$anchorScroll', function($anchorScroll) {

    console.log('Done boostrapping');

    $anchorScroll.yOffset = 50; // always scroll by 50 extra pixels*/

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

        //Controller fir left sidebar
        console.log('Start controller : searchHistoryCntr');

        //Initial state of side panel
        $scope.searchPanelUI = {
            showSeachTip: true,
            showHints: true,
            searchString: ''
        };



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

                pushToSideBarList($scope.searchPanelUI.searchString);

            }
        }


        populateGrid = function(results) {

            _.each(results, function(resultItem) {

                var normalizedResult = normalizeSearchResults(resultItem);

                normalizedResult.displayAsResultType = true;
                $scope.contentItems.push(normalizedResult);
            });
        }

        pushToSideBarList = function(newSideBarItem) {
            $scope.sideBarItems.push(newSideBarItem);
        }

        clearSideBarItems = function() {

            console.log('Clear sidebar items');
            $scope.sideBarItems = [];

        }

        clearContentItems = function() {

            console.log('Clear content items');
            $scope.contentItems = [];
        }


        normalizeSearchResults = function(item) {

            var result = {};

            var mediaType = !item.hasOwnProperty('media_type') ? 'movie' : item.media_type;

            var image = mediaType === 'person' ? item.profile_path : item.poster_path;
            if (typeof image == 'undefined') {
                imagePath = '';
            }

            result.id = item.id;
            if (mediaType === 'person') {
                result.title = item.name;
            } else if (mediaType === 'movie') {
                result.title = item.title;

            }

            result.resultTypeIcon = mediaType === 'movie' ? 'movie' : 'account_circle'
            result.image = $scope.baseImageUrl + $scope.imageW185 + image;
            result.mediaType = mediaType;
            result.cols = 1;
            result.rows = 5;

            return result;

        }




        $scope.getRelatedItems = function(item) {


            pushToSideBarList({
                title: item.title,
                image: item.image
            });


            clearContentItems();


            console.log('clicked on ', item.mediaType)

            if (item.mediaType === 'movie') {



                movieDBService.findMovieInfo(item.id).then(function(serviceResults) {

                    console.log('findMovieInfo', serviceResults)


                    var categories = ['actors', 'directors', 'producers'];

                    var resultsToGrid = [];
                    _.each(categories, function(categoryKey) {

                        if (serviceResults[categoryKey].length > 0) {
                            resultsToGrid.push({
                                displayAsCategory: true,
                                title: categoryKey,
                                cols: 4,
                                rows:1
                            });
                        }

                        _.each(serviceResults[categoryKey], function(resultCategories) {


                            resultsToGrid.push({
                                id: resultCategories.id,
                                title: resultCategories.name,
                                image: $scope.baseImageUrl + $scope.imageW185 + resultCategories.profile_path,
                                resultTypeIcon: 'account_circle',
                                cols: 1,
                                rows : 5,
                                mediaType:'person'
                            });


                        });

                    });

                    console.log(resultsToGrid)
                    $scope.contentItems = resultsToGrid;




                });

            } else {
                movieDBService.findPersonInfo(item.id).then(function(serviceResults) {

                    console.log('findPersonInfo', serviceResults)

                  
                    var categories = ['asActor', 'asDirector', 'asProducer'];

                    var resultsToGrid = [];
                    _.each(categories, function(categoryKey) {

                        if (serviceResults[categoryKey].length > 0) {
                            resultsToGrid.push({
                                displayAsCategory: true,
                                title: categoryKey,
                                cols: 4,
                                rows:1
                            });
                        }

                        _.each(serviceResults[categoryKey], function(resultCategories) {


                            resultsToGrid.push({
                                id: resultCategories.id,
                                title: resultCategories.title,
                                image: $scope.baseImageUrl + $scope.imageW185 + resultCategories.poster_path,
                                resultTypeIcon: 'movie',
                                cols: 1,
                                rows:5,
                                mediaType:'movie'
                            });


                        });

                    });

                    console.log(resultsToGrid)
                    $scope.contentItems = resultsToGrid;

                });



            }






            //http call for item detailed info

            // $mdDialog.show({
            //         controller: DialogController,
            //         templateUrl: 'moreinfo.tmpl.html',
            //         parent: angular.element(document.body),
            //         targetEvent: ev,
            //         clickOutsideToClose: true,
            //         resolve: {
            //             itemId: function() {
            //                 return itemId;
            //             }
            //         }
            //     })
            //     .then(function(answer) {
            //         //$scope.status = 'You said the information was "' + answer + '".';
            //     }, function() {
            //         //$scope.status = 'You cancelled the dialog.';
            //     });

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

function DialogController($scope, $mdDialog, itemId) {


    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
