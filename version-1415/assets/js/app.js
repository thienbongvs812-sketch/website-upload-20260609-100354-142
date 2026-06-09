(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('.filter-grid');

    if (!panel || !grid) {
      return;
    }

    var keywordInput = panel.querySelector('[data-filter-input]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var genreInput = panel.querySelector('[data-filter-genre]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var empty = document.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function yearMatches(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }

      if (selectedYear === '2010') {
        return /^201/.test(cardYear);
      }

      if (selectedYear === '2000') {
        return /^200/.test(cardYear);
      }

      return cardYear === selectedYear;
    }

    function applyFilters() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var genre = (genreInput && genreInput.value || '').trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
        var category = (card.getAttribute('data-category') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var text = [title, region, cardGenre, category, cardYear].join(' ');
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (!yearMatches(cardYear, year)) {
          matched = false;
        }

        if (genre && cardGenre.indexOf(genre) === -1 && title.indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [keywordInput, yearSelect, genreInput].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        if (genreInput) {
          genreInput.value = '';
        }

        applyFilters();
      });
    }
  }

  function createResultCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-cover" href="' + movie.url + '" aria-label="观看' + movie.title + '">',
      '    <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy" onerror="this.classList.add(\'image-error\')">',
      '    <span class="play-float">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
      '    <p class="movie-line">' + movie.oneLine + '</p>',
      '    <div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.rating + '分</span></div>',
      '    <div class="tag-row"><span>' + movie.category + '</span><span>' + movie.genre + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');

    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      input.value = initialQuery;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var matches = window.SEARCH_INDEX.filter(function (movie) {
        if (!query) {
          return movie.hot;
        }

        return movie.searchText.indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matches.map(createResultCard).join('');

      if (summary) {
        summary.textContent = query
          ? '找到 ' + matches.length + ' 条相关影片，最多显示前 120 条结果。'
          : '热门推荐';
      }
    }

    input.addEventListener('input', render);
    render();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupSearchPage();
  });
})();
