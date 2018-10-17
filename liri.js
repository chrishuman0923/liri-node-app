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

console.log(cmd, val);

/*
COMMANDS FOR LIRI.JS
node liri.js concert-this <artist/band name here>
This will search the Bands in Town Artist Events API ("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp") for an artist and render the following information about each event to the terminal:
Name of the venue
Venue location
Date of the Event (use moment to format this as "MM/DD/YYYY")
*/