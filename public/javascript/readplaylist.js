let currentSongIndex = 0;
let isPlaylistPlaying = false;
let currentPlayer = null;

window.addEventListener("DOMContentLoaded", () => {
  const globalBtn = document.getElementById("globalPlayBtn");
  const nowPlayingLabel = document.getElementById("nowPlayingLabel");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (globalBtn) {
    globalBtn.addEventListener("click", () => togglePlayPause(globalBtn, nowPlayingLabel));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => nextSong(globalBtn, nowPlayingLabel));
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => prevSong(globalBtn, nowPlayingLabel));
  }

  // Load YouTube IFrame API
  let tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
});

function togglePlayPause(globalBtn, nowPlayingLabel) {
  if (!isPlaylistPlaying) {
    playSongWithVideo(currentSongIndex, globalBtn, nowPlayingLabel);
  } else if (currentPlayer) {
    currentPlayer.pauseVideo();
    isPlaylistPlaying = false;
    globalBtn.textContent = "▶️ Play Playlist";
    nowPlayingLabel.textContent = "";
    removeHighlight(currentSongIndex);
  }
}

function playSongWithVideo(index, globalBtn, nowPlayingLabel) {
  if (!playlist[index]) return;
  currentSongIndex = index;
  isPlaylistPlaying = true;

  globalBtn.textContent = "⏸️ Pause";
  nowPlayingLabel.textContent = `🎶 Playing: ${playlist[index].title}`;

  highlightCurrentSong(index);
  showVideo(index);
}

function showVideo(index) {
  if (currentPlayer) {
    currentPlayer.destroy();
    currentPlayer = null;
  }
  const container = document.getElementById(`video-container-${index}`);
  if (!container) return;

  const videoId = getVideoIdFromUrl(playlist[index].url);

  // Only replace the video-container, not the whole card
  container.innerHTML = `<div id="ytplayer-${index}"></div>`;

  window.onYouTubeIframeAPIReady = function() {
    currentPlayer = new YT.Player(`ytplayer-${index}`, {
      height: '200',
      width: '100%',
      videoId: videoId,
      playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
      events: {
        'onStateChange': (event) => {
          if (event.data === YT.PlayerState.ENDED) {
            removeHighlight(currentSongIndex);
            nextSong(document.getElementById("globalPlayBtn"), document.getElementById("nowPlayingLabel"));
          }
        }
      }
    });
  };
  // If API already loaded
  if (window.YT && window.YT.Player) {
    window.onYouTubeIframeAPIReady();
  }
}

function nextSong(globalBtn, nowPlayingLabel) {
  if (currentSongIndex < playlist.length - 1) {
    removeHighlight(currentSongIndex);
    playSongWithVideo(currentSongIndex + 1, globalBtn, nowPlayingLabel);
  } else {
    // Loop: play from the first song again
    removeHighlight(currentSongIndex);
    playSongWithVideo(0, globalBtn, nowPlayingLabel);
  }
}

function prevSong(globalBtn, nowPlayingLabel) {
  if (currentSongIndex > 0) {
    removeHighlight(currentSongIndex);
    playSongWithVideo(currentSongIndex - 1, globalBtn, nowPlayingLabel);
  }
}

window.playOnlyThis = function(index, embedUrl, thumbUrl) {
  removeHighlight(currentSongIndex);
  playSongWithVideo(index, document.getElementById("globalPlayBtn"), document.getElementById("nowPlayingLabel"));
};

// Supports web, youtu.be, and youtube:// links
function getVideoIdFromUrl(url) {
  // Handle youtu.be links
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split(/[?&]/)[0];
  }
  // Handle youtube:// links
  if (url.startsWith("youtube://")) {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/);
    if (match) {
      return match[1];
    }
  }
  // Handle standard web links
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  } catch {
    return null;
  }
}

// Highlight the current song card
function highlightCurrentSong(index) {
  document.querySelectorAll('.video-card').forEach(card => {
    card.classList.remove('current-song');
  });
  const currentCard = document.getElementById(`card-${index}`);
  if (currentCard) {
    currentCard.classList.add('current-song');
  }
}

// Remove highlight from song card
function removeHighlight(index) {
  const currentCard = document.getElementById(`card-${index}`);
  if (currentCard) {
    currentCard.classList.remove('current-song');
  }
}