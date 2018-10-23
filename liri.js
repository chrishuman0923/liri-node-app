require('dotenv').config();

//Modules needed to make the app work
var keys = require('./keys'),
    Spotify = require('node-spotify-api'),
    moment = require('moment'),
    request = require('request'),
    fs = require('fs');

//get spotify keys and passed in args
var spotify = new Spotify(keys.spotify),
    args = process.argv,
    output = '';

//pass cmd into switch statement and execute
executeCmd(args[2], args[3]);

//Determine which command was passed and execute correct function
function executeCmd(cmd, val) {
    switch (cmd) {
        case 'concert-this':
            concertThis(cmd, val);
            break;
        case 'spotify-this-song':
            spotifyThis(cmd, val);
            break;
        case 'movie-this':
            movieThis(cmd, val);
            break;
        case 'do-what-it-says':
            doCmdFromFile();
    }
}

function concertThis(cmd, artist) {
    var url = [
            'https://rest.bandsintown.com/artists/',
            artist,
            '/events?app_id=',
            keys.bandsInTown
        ];

    //API call for Bands in Town data
    request(url.join(''), function (err, response, data) {
        //check for an error returned by the API call
        if ((err) || (response.statusCode !== 200)) {
            return console.log('Error received from Bands in Town API: ' + err);
        }

        //parse response as JSON object from string
        var concertData = JSON.parse(data);

        //No error, loop through data returned
        for(var i = 0; i < concertData.length; i++) {
            var venue = concertData[i].venue,
                //pass data into helper functions to be formatted
                name = getVenueName(venue.name),
                loc = getVenueLocation(venue.city, venue.region, venue.country),
                dte = moment(concertData[i].datetime).format('MMMM DD, YYYY');

            //format data
            output += '--------------------' +
                '\nVenue Name: ' + name +
                '\nVenue Location: ' + loc +
                '\nConcert Date: ' + dte +
                '\n--------------------';
        }

        //log data
        console.log(output);
        writeToFile(output, cmd, artist);
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

function spotifyThis(cmd, track) {
    if (!track) {
        track = "'The Sign'";
    }

    spotify.search({
        type: 'track',
        query: "'" + track + "'",
        limit: 1
    }).then(function(data) {
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

            //format data
            output += '--------------------' +
                '\nArtist(s): ' + artistArr.join(', ') +
                '\nTitle: ' + trackData.name +
                '\nAlbum: ' + trackData.album.name +
                '\nPreview URL: ' + previewLink +
                '\n--------------------';
        }

        //log data
        console.log(output);
        writeToFile(output, cmd, track);
    }).catch(function (err) {
        console.log('Error received from Spotify API: ' + err);
    });
}

function getRatingVal (data) {
    //Returns the value that is returned by the find function
    return data.Ratings.find(function (item) {
        //Return first source in array that matches Rotten Tomatoes
       return item.Source === "Rotten Tomatoes";
    }).Value;
}

function movieThis(cmd, movie) {
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

    request(url.join(''), function (err, response, data) {
        //check for an error returned by the API call
        if ((err) || (response.statusCode !== 200)) {
            return console.log('Error received from OMDB API: ' + err);
        }

        //parse response as JSON object from string
        var movieData = JSON.parse(data);

        //format data
        output = '--------------------' +
            '\nTitle: ' + movieData.Title +
            '\nRelease Year: ' + movieData.Year +
            '\nIMDB Rating: ' + movieData.imdbRating +
            '\nRotten Tomatoes Rating: ' + getRatingVal(movieData) +
            '\nProducing Country: ' + movieData.Country +
            '\nMovie Language: ' + movieData.Language +
            '\nPlot: ' + movieData.Plot +
            '\nActors: ' + movieData.Actors +
            '\n--------------------';
        
        //log data
        console.log(output);
        writeToFile(output, cmd, movie);
    });
}

function doCmdFromFile() {
    //read contents of file
    fs.readFile('./random.txt', 'utf-8', function(err, data) {
        if (err) {
            return console.log('Error reading random.txt file.');
        }

        //split string into array
        var txtArray = data.split(','),
            cmd = txtArray[0],
            val = txtArray[1].replace(/"|'/g,'');

        //pass cmd into switch statement and execute
        executeCmd(cmd, val);
    });
}

function writeToFile(log, cmd, val) {
    //Add header to log
    log = 'Command ' + cmd + ' ' + val + ' logged on ' + moment().format('MMMM DD, YYYY HH:mm:ss ') + '\n' + log + '\n\n';

    fs.appendFile('./log.txt', log, 'utf8', function(err, data) {
        if (err) {
            return console.log('Error received: ' + err);
        }
    });
}