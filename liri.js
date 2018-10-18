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

switch (cmd) {
    case "concert-this":
        concertThis(val);
        break;
}

function concertThis(artist) {
    request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + keys.bandsInTown, function (error, response, data) {
        //check for an error returned by the API call
        if ((error) || (response.statusCode !== 200)) {
            return console.log(`Error received from Bands in Town API: ${error}`);
        }

        console.log("No Error");

        // console.log(response);
        // for(var i = 0; i < body.length; i++) {
        //     console.log(data[i].venue);
        // }
    });
}

/*
COMMANDS FOR LIRI.JS
node liri.js concert-this <artist/band name here>
This will search the Bands in Town Artist Events API ("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp") for an artist and render the following information about each event to the terminal:
Name of the venue
Venue location
Date of the Event (use moment to format this as "MM/DD/YYYY")
*/