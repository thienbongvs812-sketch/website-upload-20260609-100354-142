(function () {
  "use strict";

  var root = document.body.getAttribute("data-root") || "./";

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  toArray(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = root + "search.html?q=" + encodeURIComponent(query);
      }
    });
  });

  var menuButton = document.querySelector("[data-menu-button]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slides = toArray(document.querySelectorAll("[data-hero-slide]"));
  var dots = toArray(document.querySelectorAll("[data-hero-dot]"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterGrid = document.querySelector("[data-filter-grid]");
  var searchInput = document.querySelector("[data-filter-keyword]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var resetButton = document.querySelector("[data-filter-reset]");
  var resultCount = document.querySelector("[data-result-count]");
  var emptyMessage = document.querySelector("[data-empty-message]");

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!filterGrid) {
      return;
    }
    var cards = toArray(filterGrid.querySelectorAll(".movie-card"));
    var keyword = normalize(searchInput && searchInput.value);
    var region = normalize(regionSelect && regionSelect.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre")
      ].join(" "));
      var matched = true;
      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (region && normalize(card.getAttribute("data-region")) !== region) {
        matched = false;
      }
      if (type && normalize(card.getAttribute("data-type")) !== type) {
        matched = false;
      }
      if (year && normalize(card.getAttribute("data-year")) !== year) {
        matched = false;
      }
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = "当前显示 " + visible + " 部影片";
    }
    if (emptyMessage) {
      emptyMessage.classList.toggle("is-visible", visible === 0);
    }
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (searchInput) {
        searchInput.value = "";
      }
      if (regionSelect) {
        regionSelect.value = "";
      }
      if (typeSelect) {
        typeSelect.value = "";
      }
      if (yearSelect) {
        yearSelect.value = "";
      }
      applyFilters();
    });
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      searchInput.value = q;
    }
    applyFilters();
  }

  var playerShell = document.querySelector("[data-player-shell]");
  if (playerShell) {
    var video = playerShell.querySelector("video");
    var overlay = playerShell.querySelector("[data-player-overlay]");
    var playButton = playerShell.querySelector("[data-play-button]");
    var source = playerShell.getAttribute("data-m3u8");
    var loaded = false;
    var hlsInstance = null;

    function loadVideo() {
      if (!video || !source || loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function startPlayback() {
      loadVideo();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video) {
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
    if (video) {
      video.addEventListener("play", loadVideo);
      video.addEventListener("click", function () {
        if (!loaded) {
          startPlayback();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }
})();
