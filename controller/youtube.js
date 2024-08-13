const { alldown } = require("nayan-media-downloader");
const fs = require('fs');
const axios = require('axios');
const path = require('path')
const getYtInfo = async (req, res) => {
    const { url,quality } = req.query;
    if (!url) {
        res.status(400).json({ status: 400, message: 'we need url mf' });
        return;
    }
    
    try {
        const data = await alldown(url);
        let dUrl;
        // console.log(data)
        if(quality=='low'){
           dUrl = data.data.low
        }
        else{
           dUrl = data.data.high

        }
         ;
        const title = data.data.title;
        const sanitizedTitle = title.slice(0,20).replace(/\s+/g, ''); // Remove spaces from the title
        const filePath = `./downloads/${sanitizedTitle}.mp4`; // Set the path where the file will be saved

        // Ensure the downloads directory exists
        if (!fs.existsSync('./downloads')) {
            fs.mkdirSync('./downloads');
        }

        // Download and save the file
        const response = await axios({
            method: 'get',
            url: dUrl,
            responseType: 'stream'
        });

        response.data.pipe(fs.createWriteStream(filePath));

        // Ensure the download is complete before responding
        response.data.on('end', () => {
            const pathOffile = path.join(__dirname,'.'+filePath)
            res.sendFile(pathOffile)
            setTimeout(()=>{
                if(fs.existsSync(pathOffile))
                fs.unlinkSync(pathOffile)      
            },1*60*60_000)
        });

        response.data.on('error', (err) => {
            console.error('Download failed:', err);
            res.status(500).json({ status: 500, message: 'Error downloading file', error: err.message });
            
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 500, message: 'An error occurred', error: error.message || error.msg });
    }
};

module.exports = { getYtInfo };
