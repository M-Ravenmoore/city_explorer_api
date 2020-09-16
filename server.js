'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');


const PORT = process.env.PORT;
const app = express();
app. use(cors());

app.get('/', (request,response) => {
  response.send('I am a Dragon');
});
app.get('/location',handleLocation);
app.get('/weather', handleWeather);
app.get('/trails',handleTrails);

// catch all fails
app.use ('*',notFoundHandler);

// Handler Functions

function handleLocation (req,res){
    let city = req.query.city;
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    
    superagent.get(url)
    .then(data => {
      const location = new Location(city,data.body[0]);
      console.log(data.body[0]);
      console.log(location);
      res.status(200).send(location);
    })
    .catch(err => {
      console.error(err);
      throw new Error(err.message);
    })
};

function handleWeather(req,res){
    let lon = req.query.longitude;
    let lat = req.query.latitude;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=8&key=${key}`;

    superagent(url)
    .then(weatherData => {
      console.log(weatherData.body.data[0]);
      const day = weatherData.body.data.map(day => new DailyWeather(day));
      res.status(200).send(day);
    })
    .catch(err => {
      console.error(err);
      throw new Error(err.message);
    });
}

function handleTrails(req,res){
    let lon = req.query.longitude;
    let lat = req.query.latitude;
    const key = process.env.TRAIL_API_KEY;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;

    superagent(url)
    .then(trailsData => {

      console.log(trailsData.body.trails);
      const hike = trailsData.body.trails.map(trails => new TrailInfo(trails));
      res.status(200).send(hike);
    })
    .catch(err => {
      console.error(err);
      throw new Error(err.message);
    });
};

function notFoundHandler(req,res) {
  res.status(404).send('This isnt not the page you are looking for! plese refresh and try again. ');
}
// constructor Functions

function Location(city,data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

function DailyWeather(day){
  this.forecast = day.weather.description;
  let dateFormat = day.valid_date;
  this.time = new Date(dateFormat).toDateString();
}

function TrailInfo(trail){
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionStatus;
  this.condition_date = trail.conditionDate;
}

app.listen(PORT , () => console.log(`app is listening on : ${PORT}`));