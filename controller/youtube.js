const { alldown } = require("nayan-media-downloader");
const fs = require('fs');
const axios = require('axios');
const path = require('path')
let ParseDomain  = import('parse-domain')
const getYtInfo = async (req, res) => {
    ParseDomain = await ParseDomain
   
    const { url,quality } = req.query;
    if (!url) {
        res.status(400).json({ status: 400, message: 'we need url mf' });
        return;
    }
    const domain = extractDomain(url)
    try {
        const data = await alldown(url);
        let dUrl;
        let title;
        console.log(domain)
        if(domain == 'youtube.com' || domain == 'youtu.be'){
        if(quality=='low'){
           dUrl = data.data.low;
        }
        else{
           dUrl = data.data.high;

        }
         ;
         title =  data.data.title;
        }
        
        else {
            
           return res.json({status:400,message:'Unsupported Domain'}).status(200);
        }
         
        const sanitizedTitle = title.slice(0,30).replace(/\s+/g, ''); // Remove spaces from the title
        const filePath = `./downloads/${sanitizedTitle}.mp4`; // Set the path where the file will be saved
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
        }
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
            res.setHeader('Content-Disposition', 'attachment; filename=' + sanitizedTitle);
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

function extractDomain(url) {
    const domainPattern = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i;
    const match = url.match(domainPattern);
    return match ? match[1] : null;
}