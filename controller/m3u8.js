const path = require('path')
const fs= require('fs');
const m3u8stream = require('m3u8stream')
const M3U8 = async (req, res) => {
 try {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    const fileName = `../downloads/video-${Date.now()}.ts`;
    const filePath = path.join(__dirname, fileName);

    const stream = m3u8stream(url);
    const writeStream = fs.createWriteStream(filePath);

    // Pipe the stream to the file
    let totalDownloaded = 0;

    // Pipe the stream to the file
    stream.pipe(writeStream);

    // Listen for the data event to accumulate the size of chunks
    stream.on('data', (chunk) => {
      totalDownloaded += chunk.length;
      console.log(`Downloaded ${totalDownloaded} bytes`);
    });


    // Listen for the finish event to know when the file is written
    writeStream.on('finish', () => {
        // Set headers for the file download
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Error sending file');
            }
            // Clean up the file after sending
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                }
            });
        });
    });

    // Handle errors in the streaming process
    stream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).send('Error downloading video');
    });

    writeStream.on('error', (err) => {
        console.error('Write stream error:', err);
        res.status(500).send('Error saving video');
    });
 } catch (error) {
    res.json({status:500,message:error.message}).status(500)
 }
}
module.exports = {M3U8}