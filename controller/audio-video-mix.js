const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

// Helper function to download a file from a URL
async function downloadFile(url, outputPath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(outputPath));
    writer.on('error', reject);
  });
}

// Function to combine audio and video from URLs
async function combineAudioVideo(videoUrl, audioUrl, outputDir, file) {
  const videoFilePath = path.join(outputDir, `video_${Date.now()}.mp4`);
  const audioFilePath = path.join(outputDir, `audio_${Date.now()}.mp3`);

  try {
    // Download video and audio files
    await downloadFile(videoUrl, videoFilePath);
    await downloadFile(audioUrl, audioFilePath);

    // Generate an output path based on timestamp
    const outputFilePath =file;

    return new Promise((resolve, reject) => {
      ffmpeg(videoFilePath)
        .input(audioFilePath)
        .outputOptions('-c:v copy')
        .outputOptions('-c:a aac')
        .outputOptions('-shortest')
        .save(outputFilePath)
        .on('end', () => {
          console.log('Audio and video merged successfully!');
          // Clean up downloaded files
          fs.unlinkSync(videoFilePath);
          fs.unlinkSync(audioFilePath);
          resolve(outputFilePath); // Resolve with the output path
        })
        .on('error', (err) => {
          console.error('Error occurred:', err.message);
          fs.unlinkSync(videoFilePath);
          fs.unlinkSync(audioFilePath);
          reject(err); // Reject the promise if an error occurs
        });
    });
  } catch (error) {
    console.error('Failed to download files:', error.message);
    throw error;
  }
}

module.exports = { combineAudioVideo };

// Example usage
// combineAudioVideo('https://example.com/video.mp4', 'https://example.com/audio.mp3', 'path/to/outputDir')
//   .then((outputFilePath) => {
//     console.log('Combined file saved at:', outputFilePath);
//   })
//   .catch((err) => {
//     console.error('Failed to combine files:', err);
//   });
