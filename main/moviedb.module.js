/**
 * @author Vickus van Zyl <vanzylv@gmail.com>

 */

'use strict';

var findMeMoviesApp = angular.module('findMeMoviesApp', ['ngMaterial', 'angular-loading-bar', 'ngAnimate']).filter('trustUrl', function($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
});
