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
            //pass venue name data into helper function to be formatted
            var currI = concertData[i],
                name = getVenueName(currI.venue.name),
                loc = getVenueLocation(currI.venue.city, currI.venue.region, currI.venue.country),
                dte = moment(currI.datetime).format('MMMM DD, YYYY');

            //log data returned in readable format
            console.log('Venue Name: ' + name + '\n' + 
                        'Venue Location: ' + loc + '\n' + 
                        'Concert Date: ' + dte + '\n');
        }
    });
}

function getVenueName(venueString) {
    //original value is 'abc / xyz' and only 'xyz' is desired
    var name = venueString.substring(venueString.indexOf('/') + 1, venueString.length);

    //return formatted string
    return name.trim();
}

function getVenueLocation(city, state, country) {
    return city.trim() + ', ' + state.trim() + ' ' + country.trim();
}

/*
COMMANDS FOR LIRI.JS
node liri.js spotify-this-song '<song name here>'

Artist(s)
The song's name
A preview link of the song from Spotify
The album that the song is from
*/