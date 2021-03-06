/**
 * @author Vickus van Zyl <vanzylv@gmail.com>
 */

'use strict';

findMeMoviesApp.service('movieDBService', function($http, $q) {
    var self = this;
    var apiKey = '5e13a89c7b413656c6ef6d3032f7a601';
    var base_uri = 'https://api.themoviedb.org/3/';
    var images_uri = 'https://image.tmdb.org/t/p/';

    //load themovie database configuration
    self.logAPIConfig = function() {

        return $http.get(base_uri + 'configuration?api_key=' + apiKey, {
            cached: true
        });
    }

    //find detailed information on person
    self.findPerson = function(personId) {
        return $http.get(base_uri + 'person/' + personId + '?api_key=' + apiKey, {
            cached: true
        }).then(function(response) {
            return response.data;
        });
    }

    //find detailed information on movie
    self.findMovie = function(movieId) {
        return $http.get(base_uri + 'movie/' + movieId + '?api_key=' + apiKey, {
            cached: true
        }).then(function(response) {
            return response.data;
        });
    }

    //find information related to person
    self.findPersonInfo = function(personId) {
        
        return $http.get(base_uri + 'person/' + personId + '/movie_credits?api_key=' + apiKey, {
            cached: true
        }).then(function(response) {

            var asDirector = _.filter(response.data.crew, { 'job': 'Director' });
            var asProducer = _.filter(response.data.crew, { 'job': 'Producer' });
            var asActor = _.slice(response.data.cast, 0, 4);

            return {

                asDirector: asDirector,
                asProducer: asProducer,
                asActor: asActor

            };


        });

    }

    //find information related to a movie
    self.findMovieInfo = function(movieId) {

        return $http.get(base_uri + 'movie/' + movieId + '/credits?api_key=' + apiKey, {
            cached: true
        }).then(function(response) {

            var directors = _.filter(response.data.crew, { 'job': 'Director' });
            var producers = _.filter(response.data.crew, { 'job': 'Producer' });
            var actors = _.slice(response.data.cast, 0, 4);

            return {
                directors: directors,
                producers: producers,
                actors: actors
            };

        });

    }

    self.search = function(query) {

        return $http.get(base_uri + 'search/multi?api_key=' + apiKey + '&query=fight+club', {
            cache: true
        }).then(function(response) {
            var data = response.data.results;
            var movies = _.groupBy(data, ['media_type', 'movie']).true;
            var moviesFiltered = _.chain(movies).orderBy(['popularity'], ['desc']).filter(function(item) {
                return item.vote_average > 6;
            }).value();

            var persons = _.groupBy(data, ['media_type', 'person']).true;
            var personsFiltered = _.chain(persons).orderBy(['popularity'], ['desc']).filter(function(item) {
                return item.popularity > 3;
            }).value();
            return _.concat(personsFiltered, moviesFiltered);

        }, function(err) {

            return err;

        });

    }

    //person /person/id
    //movie /movie/id
    //credits movie/47813/credits

    // http://api.themoviedb.org/3/person/510?api_key=5e13a89c7b413656c6ef6d3032f7a601
    // http://api.themoviedb.org/3/person/510/movie_credits?api_key=5e13a89c7b413656c6ef6d3032f7a601
    // http://api.themoviedb.org/3/movie/47813?api_key=5e13a89c7b413656c6ef6d3032f7a601
    // http://api.themoviedb.org/3/movie/47813/credits?api_key=5e13a89c7b413656c6ef6d3032f7a601
});
