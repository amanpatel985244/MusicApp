const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const { PassThrough } = require('stream');

router.get('/stream-audio', async (req, res) => {
  const url = req.query.url;

  if (!url || !url.includes("youtube.com/watch?v=")) {
    return res.status(400).send("Invalid YouTube URL");
  }

  try {
    console.log("🔹 Requested:", url);

    const stream = new PassThrough();

    // Use spawn to run yt-dlp directly
   const ytdlpProcess = spawn('yt-dlp', [
  '-f', 'bestaudio',
  '-o', '-',
  '--cookies', 'cookies.txt', // <-- Add this line
  url
]);

    ytdlpProcess.stdout.pipe(stream);

    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);

    ytdlpProcess.stderr.on('data', (data) => {
      console.error("yt-dlp stderr:", data.toString());
    });

    ytdlpProcess.on('error', (err) => {
      console.error("❌ yt-dlp error:", err);
      res.status(500).send("Failed to stream audio");
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Failed to stream audio");
  }
});

module.exports = router;