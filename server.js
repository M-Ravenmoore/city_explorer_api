'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg')

app. use(cors());

const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err)=>{console.error(err);});

// proof of life;
app.get('/', (req,res) => res.status(200).send('I am a Dragon'));

// Routes
app.get('/location',handleLocation);
app.get('/weather', handleWeather);
app.get('/trails',handleTrails);

// error catches

app.use ('*',(req,res) =>{
  res.status(404).send('This is not the Place you are Looking for Try again: Route Not found');
});

app.use((err, req, res, next) => {
  res.status(500).send(`Welcome to the DarkSide we have Cupcakes and a Server Error: ${err.message} : ${err.txt}`);
});


// Handler Functions

function handleLocation (req,res){
  let city = req.query.city;
  const SQLlocation = `SELECT * FROM locations WHERE search_query=$1;`;
  let safeValues = [city]
  client.query(SQLlocation,safeValues)
    .then(results => {
      if(results.rows.length > 0) {
        console.log(`ahh yes ..${req.query.city} I have memory of such a place!`)
        console.log('i have found your location:',results.rows[0])
        res.status(200).json(results.rows[0]);
      }else{
        console.log(`uh...${req.query.city} I have NO memory of any such a place! lets check the Archives...`);

        let url = `https://us1.locationiq.com/v1/search.php`;
        let queryObject = {
          city,
          key: process.env.GEOCODE_API_KEY,
          format: 'json',
          limit: 1
        };
        superagent.get(url).query(queryObject)
          .then(data => {
            const location = new Location(req.query.city,data.body[0]);
            console.log('i have found your location:',location);
            const SQL = `INSERT INTO locations (search_query,formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) returning *;`;
            const safeValues = [location.search_query,location.formatted_query,location.latitude,location.longitude];

            console.log(safeValues);
            client.query(SQL, safeValues)
              .then(results => {
                console.log('Sir i have saved your data',results.rows[0]);
              }).catch(err => {throw new Error(err.message)});
            res.status(200).send(location);
          })
          .catch(err => {throw new Error(err.message);})}
    });
}

function handleWeather(req,res){
  let lon = req.query.longitude;
  let lat = req.query.latitude;
  const today = new Date().toDateString()

  const SQLweather = `SELECT * FROM weather WHERE weather.lat=$1 AND weather.lon=$2;`;
  const safeValues = [lat,lon]
  console.log(today)

  client.query(SQLweather,safeValues)
    .then(results => {
      // console.log(results.rows)
      if(results.rows.length > 0) {
        console.log(`there is data here lets see...`)
        if(results.rows[0].time === today){
          const storedWeather = results.rows.map(day => new StoredDays(day));
          console.log(`Hello sir the weather is:`,storedWeather);
          res.status(200).send(storedWeather);
        }
      }else{
        const SQLremoveLoc = `DELETE FROM weather WHERE weather.lat=$1 AND weather.lon=$2;`;
        const safeName = [lat,lon]
        client.query(SQLremoveLoc,safeName)
        console.log(`let me go get some new weather information one moment sir...`)

        const url = `https://api.weatherbit.io/v2.0/forecast/daily`;
        let queryObject = {
          lat,
          lon,
          key: process.env.WEATHER_API_KEY,
          days: 8
        }

        superagent.get(url).query(queryObject)
          .then(weatherData => {
            const day = weatherData.body.data.map(day => new DailyWeather(day));
            console.log(`i have found your local weather and sir the weather this week will be:`,day[0])

            day.forEach(forecastDay =>{
              const SQLweatherAdd = `INSERT INTO weather (time,forecast,lon,lat) VALUES ($1,$2,$3,$4);`;
              let safeValues = [forecastDay.time,forecastDay.forecast,lon,lat];
              console.log(safeValues);
              client.query(SQLweatherAdd,safeValues)
                .then(results => {
                }).catch(err => {throw new Error(err.message)});
            })
            console.log(`Sir the weather for this week is saved`,day);
            res.status(200).send(day);
          })
          .catch(err => {throw new Error(err.message);
          });
      }
    })
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
}


// constructor Functions

function Location(city,data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}
function StoredDays(day){
  this.forecast = day.forecast
  this.time = day.time
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

client.connect()
  .then(() => {
    app.listen(PORT , () => console.log(`app is listening on : ${PORT}`));
  });


  