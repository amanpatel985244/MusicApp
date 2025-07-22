const players = {};
const songIndexes = {};
const audioCache = {};
let currentIndex = null;

const bgVideo = document.getElementById("bgVideo");
let unmuteTimeout = null;

// 🔹 Enable video audio after first click (needed for autoplay with sound)
document.addEventListener("click", () => {
  if (bgVideo && bgVideo.paused) {
    bgVideo.play().catch(() => console.warn("Autoplay may be blocked"));
  }
}, { once: true });

// 🔹 Mute video immediately when song starts
function muteVideoDuringPlayback() {
  if (bgVideo) {
    bgVideo.muted = true;
    if (unmuteTimeout) clearTimeout(unmuteTimeout);
  }
}

// 🔹 Schedule video to unmute 30s after no song is playing
function scheduleUnmuteVideo() {
  if (bgVideo) {
    if (unmuteTimeout) clearTimeout(unmuteTimeout);
    unmuteTimeout = setTimeout(() => {
      bgVideo.muted = false;
    }, 30000); // 30 seconds
  }
}

// 🔹 Toggle play/pause
function togglePlay(index) {
  const songs = window.playlists[index];
  if (!songs || songs.length === 0) return;

  const audio = document.getElementById(`audioPlayer-${index}`);
  const btn = document.getElementById(`playBtn-${index}`);
  const controls = document.getElementById(`controls-${index}`);
  const title = document.getElementById(`songTitle-${index}`);
  const prevBtn = document.getElementById(`prevBtn-${index}`);
  const nextBtn = document.getElementById(`nextBtn-${index}`);

  // Stop previous playlist
  if (currentIndex !== null && currentIndex !== index) {
    const prevAudio = document.getElementById(`audioPlayer-${currentIndex}`);
    const prevBtn = document.getElementById(`playBtn-${currentIndex}`);
    const prevControls = document.getElementById(`controls-${currentIndex}`);

    if (prevAudio) prevAudio.pause();
    if (prevAudio) prevAudio.classList.add("hidden");
    if (prevControls) prevControls.classList.add("hidden");
    if (prevBtn) prevBtn.textContent = "▶️ Play";

    players[currentIndex] = null;
  }

  currentIndex = index;

  if (!players[index]) {
    audio.classList.remove("hidden");
    controls.classList.remove("hidden");

    songIndexes[index] = songIndexes[index] || 0;
    players[index] = audio;

    playSong(index);

    audio.onended = () => {
      if (songIndexes[index] < songs.length - 1) {
        songIndexes[index]++;
        playSong(index);
      } else {
        resetPlayer(index);
      }
    };
  } else {
    if (audio.paused) {
      audio.play();
      btn.textContent = "⏸️ Pause";
      muteVideoDuringPlayback();
    } else {
      audio.pause();
      btn.textContent = "▶️ Play";
      scheduleUnmuteVideo();
    }
  }
}

// 🔹 Play song logic
function playSong(index) {
  const songs = window.playlists[index];
  const current = songIndexes[index];
  const audio = document.getElementById(`audioPlayer-${index}`);
  const btn = document.getElementById(`playBtn-${index}`);
  const title = document.getElementById(`songTitle-${index}`);
  const prevBtn = document.getElementById(`prevBtn-${index}`);
  const nextBtn = document.getElementById(`nextBtn-${index}`);

  const song = songs[current];

  if (!audioCache[song.url]) {
    audioCache[song.url] = getStreamableAudio(song.url);
  }

  audio.src = audioCache[song.url];
  audio.play();
  btn.textContent = "⏸️ Pause";
  title.textContent = `🎶 Playing: ${song.title}`;

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === songs.length - 1;

  prevBtn.classList.toggle("opacity-50", current === 0);
  nextBtn.classList.toggle("opacity-50", current === songs.length - 1);

  muteVideoDuringPlayback();

  // Preload next song
  if (current + 1 < songs.length) {
    const nextUrl = songs[current + 1].url;
    if (!audioCache[nextUrl]) {
      const audioPreload = new Audio();
      audioPreload.src = getStreamableAudio(nextUrl);
      audioCache[nextUrl] = audioPreload.src;
    }
  }
}

// 🔹 Next/Previous
function nextSong(index) {
  if (songIndexes[index] < window.playlists[index].length - 1) {
    songIndexes[index]++;
    playSong(index);
  }
}

function prevSong(index) {
  if (songIndexes[index] > 0) {
    songIndexes[index]--;
    playSong(index);
  } else {
    playSong(index);
  }
}

// 🔹 When playlist ends
function resetPlayer(index) {
  const audio = document.getElementById(`audioPlayer-${index}`);
  const btn = document.getElementById(`playBtn-${index}`);
  const controls = document.getElementById(`controls-${index}`);

  btn.textContent = "▶️ Play";
  audio.classList.add("hidden");
  controls.classList.add("hidden");
  players[index] = null;
  songIndexes[index] = 0;

  scheduleUnmuteVideo();
}

function getStreamableAudio(youtubeUrl) {
  try {
    const urlObj = new URL(youtubeUrl);
    const videoId = urlObj.searchParams.get('v');
    if (!videoId) return null;

    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const baseUrl =
      window.location.hostname === 'localhost'
        ? 'http://localhost:8080'
        : '';

    return `${baseUrl}/stream-audio?url=${encodeURIComponent(cleanUrl)}`;
  } catch (err) {
    console.error('Invalid YouTube URL:', youtubeUrl);
    return null;
  }
}




