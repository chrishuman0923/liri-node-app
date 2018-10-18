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
            return console.log(`Error received from Bands in Town API: ${error}`);
        }

        //Data returned as string, parse into array of objects
        var concertData = JSON.parse(data);

        //No error, loop through data returned
        for(var i = 0; i < concertData.length; i++) {
            //pass venue name data into helper function to be formatted
            var venue = getVenueName(concertData[i].venue.name);

            console.log(venue);
        }
    });
}

function getVenueName(venueString) {
    //original value is 'abc / xyz' and only 'xyz' is desired
    var name = venueString.substring(venueString.indexOf('/') + 1, venueString.length);

    //return formatted string
    return name.trim();
}

/*
COMMANDS FOR LIRI.JS
node liri.js concert-this <artist/band name here>
This will search the Bands in Town Artist Events API ('https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp') for an artist and render the following information about each event to the terminal:
Name of the venue
Venue location
Date of the Event (use moment to format this as 'MM/DD/YYYY')
*/