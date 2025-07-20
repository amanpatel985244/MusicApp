  let prevScroll = window.pageYOffset;
    const navbar = document.getElementById('navbar');
    window.onscroll = () => {
      const currentScroll = window.pageYOffset;
      if (prevScroll > currentScroll) {
        navbar.classList.remove('hide-nav');
        navbar.classList.add('show-nav');
      } else {
        navbar.classList.remove('show-nav');
        navbar.classList.add('hide-nav');
      }
      prevScroll = currentScroll;
    };

    let currentPlaying = null;
    function playVideo(container) {
      if (currentPlaying && currentPlaying !== container) {
        const thumb = currentPlaying.dataset.thumbnail;
        currentPlaying.innerHTML = `<img src="${thumb}" class="rounded mb-2 w-full cursor-pointer" onclick="playVideo(this.parentElement)" />`;
      }
      const embedUrl = container.dataset.embed;
      container.innerHTML = `<iframe class="w-full aspect-video rounded" src="${embedUrl}" allow="autoplay" allowfullscreen></iframe>`;
      currentPlaying = container;

      
      
    }