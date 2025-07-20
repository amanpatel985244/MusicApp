const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.get("/stream-audio", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("No URL provided");

  res.set({
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
  });

  const ytdlp = spawn("yt-dlp", ["-f", "bestaudio", "-o", "-", videoUrl]);

  ytdlp.stdout.pipe(res);
  ytdlp.stderr.on("data", (data) => console.error(`yt-dlp error: ${data}`));
  ytdlp.on("close", () => res.end());
});

module.exports = router;
