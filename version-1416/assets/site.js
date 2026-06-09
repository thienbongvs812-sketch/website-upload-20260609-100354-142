const MovieUI = (() => {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;
    const activate = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    const start = () => {
      stop();
      timer = window.setInterval(() => activate(index + 1), 5600);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        activate(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function initFilters() {
    const panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    const input = panel.querySelector("[data-search-input]");
    const select = panel.querySelector("[data-sort-select]");
    const grid = document.querySelector("[data-card-grid]");
    const empty = document.querySelector("[data-empty-state]");
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
    const normalize = value => String(value || "").toLowerCase().trim();
    const apply = () => {
      const query = normalize(input ? input.value : "");
      let visible = 0;
      cards.forEach(card => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.keywords
        ].join(" "));
        const matched = !query || haystack.includes(query);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    const sortCards = () => {
      const value = select ? select.value : "default";
      const sorted = cards.slice();
      if (value === "year-desc") {
        sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
      }
      if (value === "year-asc") {
        sorted.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0));
      }
      if (value === "title-asc") {
        sorted.sort((a, b) => String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN"));
      }
      sorted.forEach(card => grid.appendChild(card));
      apply();
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", sortCards);
    }
    apply();
  }

  function initPlayer(videoId, buttonId, coverId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const cover = document.getElementById(coverId);
    if (!video || !button || !cover || !sourceUrl) {
      return;
    }
    let attached = false;
    let hls = null;
    const attach = () => {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      attached = true;
    };
    const play = () => {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    };
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      play();
    });
    cover.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(() => {
    initMenu();
    initHero();
    initFilters();
  });

  return {
    initPlayer
  };
})();
