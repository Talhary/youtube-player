const express = require('express');
const app = express();

//modules
const fs = require('fs')
const youtubeRoute = require('./route/get-yt-info')

//Express stuff and environment variables
require('dotenv').config();
require('express-async-errors')

//Used By Express
app.use(express.json());
app.use(express.static('./public'))

//routes
app.use('/api/v1',youtubeRoute)


const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log('server runngindfkd')
})