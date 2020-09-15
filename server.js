'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');


const PORT = process.env.PORT;
const app = express();
app. use(cors());

app.get('/', (request,response) => {
  response.send('I am a Dragon')
})

app.listen(PORT , () => console.log(`app is listening on : ${PORT}`));