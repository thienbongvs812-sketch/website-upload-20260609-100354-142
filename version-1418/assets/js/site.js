(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-hidden');
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        if (slides.length) {
            var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
            var current = Math.max(0, slides.findIndex(function (slide) {
                return slide.classList.contains('active');
            }));
            var timer;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle('active', position === current);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle('active', position === current);
                });
            }

            function startTimer() {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }

            function resetTimer() {
                window.clearInterval(timer);
                startTimer();
            }

            document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
                button.addEventListener('click', function () {
                    showSlide(current - 1);
                    resetTimer();
                });
            });

            document.querySelectorAll('[data-hero-next]').forEach(function (button) {
                button.addEventListener('click', function () {
                    showSlide(current + 1);
                    resetTimer();
                });
            });

            dots.forEach(function (dot, position) {
                dot.addEventListener('click', function () {
                    showSlide(position);
                    resetTimer();
                });
            });

            showSlide(current);
            startTimer();
        }

        var filterPage = document.body && document.body.getAttribute('data-filter-page') === 'true';
        var localInput = document.querySelector('[data-local-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var emptyState = document.querySelector('[data-empty-state]');

        function applyFilter(value) {
            var query = (value || '').trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var match = !query || haystack.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        if (filterPage && localInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            if (q) {
                localInput.value = q;
                applyFilter(q);
            }
            localInput.addEventListener('input', function () {
                applyFilter(localInput.value);
            });
        }

        document.querySelectorAll('[data-query]').forEach(function (button) {
            button.addEventListener('click', function () {
                var query = button.getAttribute('data-query') || '';
                if (localInput) {
                    localInput.value = query;
                    applyFilter(query);
                    localInput.focus();
                }
            });
        });

        if (filterPage) {
            document.querySelectorAll('[data-search-form]').forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (localInput) {
                        event.preventDefault();
                        applyFilter(localInput.value);
                    }
                });
            });
        }

        var video = document.querySelector('[data-player-video]');
        var playButton = document.querySelector('[data-player-button]');
        var playLayer = document.querySelector('[data-player-layer]');
        var hlsInstance = null;
        var prepared = false;

        function preparePlayer() {
            if (!video || prepared) {
                return;
            }
            var src = video.getAttribute('data-stream');
            if (!src) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            }
            prepared = true;
        }

        if (video && playButton) {
            playButton.addEventListener('click', function () {
                preparePlayer();
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
                if (playLayer) {
                    playLayer.classList.add('is-playing');
                }
            });
            video.addEventListener('play', function () {
                if (playLayer) {
                    playLayer.classList.add('is-playing');
                }
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 && playLayer) {
                    playLayer.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
