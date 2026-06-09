(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function activate(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function next() {
            if (!slides.length) {
                return;
            }
            activate((current + 1) % slides.length);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot'));
                activate(index);
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(next, 5200);
            });
        });

        if (slides.length > 1) {
            timer = window.setInterval(next, 5200);
        }
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    filterPanels.forEach(function (panel) {
        var section = panel.parentElement;
        var list = section ? section.querySelector('[data-filter-list]') : null;
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .rank-row'));
        var input = panel.querySelector('[data-filter-input]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var regionSelect = panel.querySelector('[data-filter-region]');

        fillSelect(yearSelect, collect(cards, 'year').sort(function (a, b) { return Number(b) - Number(a); }));
        fillSelect(typeSelect, collect(cards, 'type').sort());
        fillSelect(regionSelect, collect(cards, 'region').sort());

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.tags,
                    card.dataset.genre
                ].join(' ').toLowerCase();
                var matched = true;
                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && card.dataset.year !== year) {
                    matched = false;
                }
                if (type && card.dataset.type !== type) {
                    matched = false;
                }
                if (region && card.dataset.region !== region) {
                    matched = false;
                }
                card.classList.toggle('is-hidden-by-filter', !matched);
            });
        }

        [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    function collect(cards, key) {
        var result = [];
        cards.forEach(function (card) {
            var value = card.dataset[key] || '';
            if (value && result.indexOf(value) === -1) {
                result.push(value);
            }
        });
        return result;
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-video');
        var trigger = document.querySelector('[data-player-trigger]');
        if (!video || !streamUrl) {
            return;
        }
        var ready = false;
        var hls = null;

        function bindStream() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            bindStream();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
