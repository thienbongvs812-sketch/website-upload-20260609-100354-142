(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initialiseHls(video, source) {
    if (!video || !source) {
      return;
    }

    if (video.dataset.loaded === 'true') {
      return;
    }

    video.dataset.loaded = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }

    video.src = source;
  }

  function setupPlayer(box) {
    var source = box.getAttribute('data-video-url');
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');

    if (!video || !source) {
      return;
    }

    function play() {
      initialiseHls(video, source);
      box.classList.add('is-playing');

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        box.classList.remove('is-playing');
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
