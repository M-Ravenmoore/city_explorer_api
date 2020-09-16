'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');


const PORT = process.env.PORT;
const app = express();
app. use(cors());

app.get('/', (request,response) => {
  response.send('I am a Dragon')
});
app.get('/location',handleLocation)
app.get('/weather', handleWeather);

// catch all fails
app.use ('*',notFoundHandler)

// Handler Functions

function handleLocation (req,res){
  try{
    let city = req.query.city;
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    
    superagent.get(url)
    .then(data => {
      const location = new Location(city,data.body[0])
      console.log(data.body[0])
      console.log(location)
      res.send(location)
    })
    .catch(err => console.error(err))
    
  }catch (error){
    console.log('ERROR', error);
    response.status(500).send('Join the dark side we have cookies and Errors please come back soon')
  }
};

function handleWeather(req,res){
  try {
    let lon = req.query.longitude;
    let lat = req.query.latitude;
    const key = process.env.WEATHER_API_KEY;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=8&key=${key}`;

    superagent(url)
    .then(weatherData => {
      console.log(weatherData.body.data[0])
      const day = weatherData.body.data.map(day => new DailyWeather(day))
      res.send(day)
    })
  }catch(error){
    console.log('ERROR', error);
    response.status(500).send('Join the dark side we have cookies and Errors please come back soon')
  }
}

function notFoundHandler(req,res) {
  res.status(404).send('This isnt not the page you are looking for! plese refresh and try again. ')
}
// HelperFunctions

function Location(city,data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

function DailyWeather(day){
  this.forecast = day.weather.description;
  let dateFormat = day.valid_date;
  this.time = new Date(dateFormat).toDateString()
}
// function Trail(trail){
// this.name= Mt. Si",
// this.location= ": "Tanner, Washington",
// this.length =": "6.6",
// this.stars =": "4.4",
// this.star_votes =": "72",
// this.summary =": "A steep, well-maintained trail takes you atop Mt. Si with outrageous views of Puget Sound.",
// this.trail_url =": "https://www.hikingproject.com/trail/7001016/mt-si",
// this.conditions =": "Dry",
// this.condition_date =": "2018-07-22",
// this.condition_time =": "0:17:22 "
// }

app.listen(PORT , () => console.log(`app is listening on : ${PORT}`));