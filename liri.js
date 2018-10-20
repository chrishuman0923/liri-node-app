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
                'Venue Name: ' + name + '\n' + 
                'Venue Location: ' + loc + '\n' + 
                'Concert Date: ' + dte + '\n'
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
    spotify.search({
        type: 'track',
        query: '"' + track + '"',
        limit: 1
    }, function(err, data) {
        if (err) {
            return console.log('Error received from Spotify API: ' + err);
        }

        var resp = data.tracks.items;

        for (var i = 0; i < resp.length; i++) {
            var trackData = data.tracks.items[i],
                artistArr = [],
                title,
                previewLink,
                album;

            //get artist(s)
            trackData.artists.forEach(function(index) {
                //push value into array
                artistArr.push(index.name);
            });

            console.log(
                'Artist(s): ' + artistArr + '\n'
            );
        }

        //artist(s)
        //data.tracks.items[0].artists[0].name

        //song title
        //data.tracks.items[0].name

        //preview link
        //data.tracks.items[0].preview_url

        //album name
        //data.tracks.items[0].album.name

    });
}

/*
COMMANDS FOR LIRI.JS
node liri.js spotify-this-song '<song name here>'

Artist(s)
The song's name
A preview link of the song from Spotify
The album that the song is from
*/