require('dotenv').config();

// Modules needed to make the app work
const Spotify = require('node-spotify-api');
const moment = require('moment');
const request = require('request');
const fs = require('fs');

// File containing an object of all .env variables
const keys = require('./keys');

// get spotify keys and passed in args
const spotify = new Spotify(keys.spotify);
const args = process.argv;
let output = '';

const getVenueName = (val) => {
  // original value is 'abc / xyz' and only 'xyz' is desired
  const venueName = val.substring(val.indexOf('/') + 1, val.length);

  return venueName.trim();
};

const getVenueLocation = (city, state, country) => `${city.trim()}, ${state.trim()} ${country.trim()}`;

const writeToFile = (log, cmd, val) => {
  // Add header to log
  const newLog = `Command ${cmd} -> "${val}" logged on ${moment().format('MMMM DD, YYYY HH:mm:ss ')}
  ${log}\n\n`;

  fs.appendFile('./log.txt', newLog, 'utf8', (err) => {
    if (err) {
      return console.log(`Error received: ${err}`);
    }

    return true;
  });
};

const concertThis = (cmd, artist) => {
  const url = `https://rest.bandsintown.com/artists/artist/events?app_id=${keys.bandsInTown}`;

  // API call for Bands in Town data
  request(url, (err, response, data) => {
    // check for an error returned by the API call
    if ((err) || (response.statusCode !== 200)) {
      return console.log(`Error received from Bands in Town API: ${err}`);
    }

    // parse response as JSON object from string
    const concertData = JSON.parse(data);

    concertData.forEach((concert) => {
      const { venue } = concert;

      // pass data into helper functions to be formatted
      const name = getVenueName(venue.name);
      const loc = getVenueLocation(venue.city, venue.region, venue.country);
      const dte = moment(concert.datetime).format('MMMM DD, YYYY');

      // format data
      output += `--------------------
                \nVenue Name: ${name}
                \nVenue Location: ${loc}
                \nConcert Date: ${dte}
                \n--------------------`;
    });

    // log data
    console.log(output);
    return writeToFile(output, cmd, artist);
  });
};

const spotifyThis = (cmd, track) => {
  const trackName = (!track) ? 'The Sign' : track;

  spotify
    .search({
      type: 'track',
      query: trackName,
      limit: 1,
    })
    .then((data) => {
      data.tracks.items.forEach((item) => {
        const artistArr = [];

        // Get artist(s) portion of response object
        item.artists.forEach((artist) => {
          artistArr.push(artist.name.trim());
        });

        // format data
        output += `--------------------'
                  \nArtist(s): ${artistArr.join(', ')}
                  \nTitle: ${item.name}
                  \nAlbum: ${item.album.name}
                  \nPreview URL: ${(!item.preview_url) ? 'Not Provided by API' : track.preview_url}
                  \n--------------------`;
      });

      // log data
      console.log(output);
      writeToFile(output, cmd, track);
    })
    .catch(err => console.log(`Error received from Spotify API: ${err}`));
};

const getRatingVal = data => data.Ratings.filter(rating => rating.Source === 'Rotten Tomatoes').map(filteredVal => filteredVal.Value);

const movieThis = (cmd, movie) => {
  const title = (!movie) ? 'Mr. Nobody' : movie;

  const url = `https://www.omdbapi.com/?apikey=${keys.ombd.appID}&type=movie&r=json&t=${title}`;

  console.log(url);
  request(url, (err, response, data) => {
    // check for an error returned by the API call
    if ((err) || (response.statusCode !== 200)) {
      return console.log(`Error received from OMDB API: ${err}`);
    }

    // parse response as JSON object from string
    const movieData = JSON.parse(data);

    // format data
    output = `--------------------
              \nTitle: ${movieData.Title}
              \rRelease Year: ${movieData.Year}
              \rIMDB Rating: ${movieData.imdbRating}
              \rRotten Tomatoes Rating: ${(!getRatingVal(movieData)) ? 'No Rating Data' : getRatingVal(movieData)}
              \nProducing Country: ${movieData.Country}
              \nMovie Language: ${movieData.Language}
              \nPlot: ${movieData.Plot}
              \nActors: ${movieData.Actors}
              \n--------------------`;

    // log data
    console.log(output);
    return writeToFile(output, cmd, movie);
  });
};

const executeCmd = (cmd, val) => {
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
    default:
      doCmdFromFile();
  }
};

const doCmdFromFile = () => {
  // read contents of file
  fs.readFile('./random.txt', 'utf-8', (err, data) => {
    if (err) {
      return console.log('Error reading random.txt file.');
    }

    // split string into array
    const txtArray = data.split(',');
    const cmd = txtArray[0];
    const val = txtArray[1].replace(/"|'/g, '');

    // pass cmd into switch statement and execute
    return executeCmd(cmd, val);
  });
};

// pass cmd into switch statement and execute
executeCmd(args[2], args[3]);
