(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-region") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function setFilters() {
        var input = document.querySelector("[data-search-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-item"));
        var year = "all";
        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var matchQuery = !query || textOf(card).indexOf(query) !== -1;
                var matchYear = year === "all" || card.getAttribute("data-year") === year;
                card.classList.toggle("is-filter-hidden", !(matchQuery && matchYear));
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]")).forEach(function (button) {
            button.addEventListener("click", function () {
                year = button.getAttribute("data-filter-year") || "all";
                Array.prototype.slice.call(button.parentElement.querySelectorAll("button")).forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    window.initMoviePlayer = function (videoId, coverId, sourceUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !sourceUrl) {
            return;
        }
        var started = false;
        function prepare() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function play() {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        setMenu();
        setHero();
        setFilters();
    });
})();
