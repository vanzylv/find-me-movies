findMeMoviesApp.service('movieDBService', function($http, $q) {
    var self = this;
    var apiKey = '5e13a89c7b413656c6ef6d3032f7a601';
    var base_uri = 'https://api.themoviedb.org/3/';
    var images_uri = 'https://image.tmdb.org/t/p/';

    self.logAPIConfig = function() {

        return $http.get(base_uri + 'configuration?api_key=' + apiKey);

    }

    self.findMovie = function(minRating, movieId) {

        return $http.get(base_uri + 'movie/' + movieId + '?api_key=' + apiKey, {

        }).then(function(response) {

            if (response.data.vote_average > minRating && response.data.vote_count > 50) {

                return response.data;
            }

        });
    }

    self.findPersonInfo = function(personId) {

        //['Actor','Producer','Director']
        console.log('PERSON INFO : ', base_uri + 'person/' + personId + '/movie_credits?api_key=' + apiKey)
        return $http.get(base_uri + 'person/' + personId + '/movie_credits?api_key=' + apiKey, {

        }).then(function(response) {

            var asDirector = _.filter(response.data.crew, { 'job': 'Director' });
            var asProducer = _.filter(response.data.crew, { 'job': 'Producer' });
            var asActor = _.slice(response.data.cast, 0, 4);

            console.log('As Director', asDirector);
            console.log('As Producer', asProducer);
            console.log('As Actor', asActor);

            return {

                asDirector: asDirector,
                asProducer: asProducer,
                asActor: asActor

            };


        });

    }

    self.findMovieInfo = function(movieId) {
        //['Actors','Directors','Producers']

        console.log('find movie info', base_uri + 'movie/' + movieId + '/credits?api_key=' + apiKey);

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
