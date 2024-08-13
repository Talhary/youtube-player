const express = require('express');
const app = express();

//modules
const fs = require('fs')
const cors = require('cors')



const youtubeRoute = require('./route/get-yt-info')

//Express stuff and environment variables
require('dotenv').config();
require('express-async-errors')

//Used By Express
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5500',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
   ))
app.use(express.static('./public'))
//routes
app.use('/api/v1',youtubeRoute)


const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log('server runngindfkd')
})