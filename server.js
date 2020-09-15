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

app.get('/location', handleLocation);

app.get('/location2',(req,res)=>{
  let city = req.query.city;
  let key = process.env;
  let url = `the key url useing ${key} and ${city}`
  superagent.get(url)
    .then(data => console.log(data))
    .then(data => res.send(data))
    .catch(err => console.error(err));
})
app.get('/weather', handleWeather);


function handleLocation(request, response) {
  try {
    const rawLocationData = require('./data/location.json');
    const cityInput = request.query.city;
    const locationData = new Location(cityInput,rawLocationData);
    response.send(locationData);
  }catch (error){
    console.log('ERROR', error);
    response.status(500).send('Join the dark side we have cookies and Errors please come back soon')
  }
};

function handleWeather(request, response) {
  try {
    const rawWeatherData = require('./data/weather.json');
    const weatherArr = [];
    rawWeatherData.data.forEach(day => {
      weatherArr.push(new Weather(day))
    })
    response.send(weatherArr);
  }catch(error){
    console.log('ERROR', error);
    response.status(500).send('Join the dark side we have cookies and Errors please come back soon')
  }
}

function Location(cityInput,rawLocationData) {
  this.search_query = cityInput;
  this.formatted_query = rawLocationData[0].display_name;
  this.latitude = rawLocationData[0].lat;
  this.longitude = rawLocationData[0].lon;
}

function Weather(day){
  this.forecast = day.weather.description;
  this.time = day.valid_date;
}
app.use ('*',notFoundHandler)
function notFoundHandler(req,res) {
  res.status(404).send('This isn not the page you are looking for! plese refresh and try again. ')
}

app.listen(PORT , () => console.log(`app is listening on : ${PORT}`));