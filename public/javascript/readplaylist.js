    let currentPlaying = null;

    function playOnlyThis(index, embedUrl, thumbUrl) {
      // Pause previous video and restore its thumbnail
      if (currentPlaying !== null && currentPlaying !== index) {
        restoreThumbnail(currentPlaying);
      }

      const container = document.getElementById(`video-container-${index}`);
      const card = document.getElementById(`card-${index}`);

      // If same card is clicked again, toggle back to thumbnail
      if (currentPlaying === index) {
        restoreThumbnail(index);
        currentPlaying = null;
        return;
      }

      // Replace thumbnail with iframe
      container.outerHTML = `
        <div class="w-full" id="video-container-${index}">
          <iframe width="100%" height="200" src="${embedUrl}" frameborder="0"
            allow="autoplay; encrypted-media" allowfullscreen class="rounded-t-xl"></iframe>
        </div>
      `;

      currentPlaying = index;
    }

    function restoreThumbnail(index) {
      const container = document.getElementById(`video-container-${index}`);
      const embedUrl = container.querySelector("iframe")?.src;
      const videoId = embedUrl?.split("/embed/")[1]?.split("?")[0];
      const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      container.outerHTML = `
        <div class="relative cursor-pointer" id="video-container-${index}"
             onclick="playOnlyThis(${index}, 'https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0', '${thumb}')">
          <img src="${thumb}" class="w-full h-48 object-cover" />
          <div class="play-overlay absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      `;
    }