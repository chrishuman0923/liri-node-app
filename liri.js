require('dotenv').config();

//Modules needed to make the app work
var keys = require('./keys'),
    Spotify = require('node-spotify-api'),
    moment = require('moment'),
    request = require('request');

//get spotify keys and passed in args
var spotify = new Spotify(keys.spotify),
    args = process.argv,
    cmd = args[2],
    val = args[3];

//Determine which command was passed and execute correct function
switch (cmd) {
    case 'concert-this':
        concertThis(val);
        break;
    case 'spotify-this-song':
        spotifyThis(val);
        break;
    case 'movie-this':
        movieThis(val);
        break;
}

function concertThis(artist) {
    var url = [
            'https://rest.bandsintown.com/artists/',
            artist,
            '/events?app_id=',
            keys.bandsInTown
        ];

    //API call for Bands in Town data
    request(url.join(''), function (error, response, data) {
        //check for an error returned by the API call
        if ((error) || (response.statusCode !== 200)) {
            return console.log('Error received from Bands in Town API: ' + error);
        }

        //Data returned as string, parse into array of objects
        var concertData = JSON.parse(data);

        //No error, loop through data returned
        for(var i = 0; i < concertData.length; i++) {
            var venue = concertData[i].venue,
                //pass data into helper functions to be formatted
                name = getVenueName(venue.name),
                loc = getVenueLocation(venue.city, venue.region, venue.country),
                dte = moment(concertData[i].datetime).format('MMMM DD, YYYY');

            //log data returned in readable format
            console.log(
                '--------------------' +
                '\nVenue Name: ' + name +
                '\nVenue Location: ' + loc +
                '\nConcert Date: ' + dte +
                '\n--------------------'
            );
        }
    });
}

//helper function to parse the venue name
function getVenueName(val) {
    //original value is 'abc / xyz' and only 'xyz' is desired
    var venueName = val.substring(val.indexOf('/') + 1, val.length);

    //return formatted string
    return venueName.trim();
}

//helper function to format venue location data into one string
function getVenueLocation(city, state, country) {
    return city.trim() + ', ' + state.trim() + ' ' + country.trim();
}

function spotifyThis(track) {
    if (!track) {
        track = "'The Sign'";
    }

    spotify.search({
        type: 'track',
        query: "'" + track + "'"
    }, function(err, data) {
        if (err) {
            return console.log('Error received from Spotify API: ' + err);
        }

        //create variable at correct level of returned object
        var resp = data.tracks.items;

        for (var i = 0; i < resp.length; i++) {
            var trackData = data.tracks.items[i],
                artistArr = [],
                previewLink;

            //get artist(s) portion of response object
            trackData.artists.forEach(function(index) {
                //push value into array
                artistArr.push(index.name.trim());
            });

            //Formats preview link if not provided by API
            previewLink = (trackData.preview_url) ? trackData.preview_url : 'Not Provided by API';

            console.log(
                '--------------------' +
                '\nArtist(s): ' + artistArr.join(', ') +
                '\nTitle: ' + trackData.name +
                '\nAlbum: ' + trackData.album.name +
                '\nPreview URL: ' + previewLink +
                '\n--------------------'
            );
        }
    });
}

function movieThis(movie) {
    if (!movie) {
        movie = 'Mr. Nobody';
    }

    var url = [
        'https://www.omdbapi.com/?',
        'apikey=',
        keys.ombd.appID,
        '&type=movie',
        '&r=json',
        '&t=',
        movie
    ];

    request(url.join(''), function (error, response, data) {
        //check for an error returned by the API call
        if ((error) || (response.statusCode !== 200)) {
            return console.log('Error received from OMDB API: ' + error);
        }

        var movieData = JSON.parse(data);
        
        console.log(
            '--------------------' +
            '\nTitle: ' + movieData.Title +
            '\nRelease Year: ' + movieData.Year +
            '\nIMDB Rating: ' + movieData.imdbRating +
            '\n--------------------'
        );      
    });
}

/*
COMMANDS FOR LIRI.JS
    * Rotten Tomatoes Rating of the movie.
    * Country where the movie was produced.
    * Language of the movie.
    * Plot of the movie.
    * Actors in the movie.
*/