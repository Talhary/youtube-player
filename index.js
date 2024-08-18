const express = require('express');
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');
const url = require('url');
//modules
const fs = require('fs')
const cors = require('cors')
const axios = require('axios');


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








app.use('/video', (req, res, next) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
      return res.status(400).send('URL is required');
    }
    try {
      new URL(videoUrl); // Validate URL format
      next();
    } catch (err) {
      res.status(400).send('Invalid URL');
    }
  });
  
  // Proxy middleware to forward the video request
  app.use('/video', createProxyMiddleware({
    target: '', // No target host needed because we are dynamically routing based on URL
    changeOrigin: true,
       
    router: (req) => {
      const videoUrl = req.query.url;
      const parsedUrl = url.parse(videoUrl);
      
      const ret= `${parsedUrl.protocol}//${parsedUrl.host}`;
      
      return ret
    },
    
    pathRewrite: (path, req) => {
        
        const videoUrl = req.query.url;
        const parsedUrl = url.parse(videoUrl);
        return parsedUrl.path; // Keep the full path and its extension
    },
      
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send('Error fetching video');
    }
  }));
  


const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log('server runngindfkd')
})
