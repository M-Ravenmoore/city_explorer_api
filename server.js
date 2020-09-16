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
app.use ('*',notFoundHandler)
app.get('/location',handleLocation)
app.get('/weather', handleWeather);


// Handler Functions

function handleLocation (req,res){
  try{
    let city = req.query.city;
    let key = process.env.GEOCODE_API_KEY;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    
    superagent.get(url)
    .then(data => {
      const location = new Location(city,data.body[0])
      console.log(data.body)
      console.log(location)
      res.send(location)
    })
    .catch(err => console.error(err))
    
  }catch (error){
    console.log('ERROR', error);
    response.status(500).send('Join the dark side we have cookies and Errors please come back soon')
  }
};

function handleWeather(request, response) {
  try {
    const rawWeatherData = require('./data/weather.json');
    const weatherArr = rawWeatherData.data.map(day => new Weather(day));
    console.log(weatherArr)

    response.send(weatherArr);
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

function Weather(day){
  this.forecast = day.weather.description;
  this.time = day.valid_date;
}


app.listen(PORT , () => console.log(`app is listening on : ${PORT}`));