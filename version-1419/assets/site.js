function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    initHeroSlider();
    initLocalFilters();
    initSearchPage();
});

function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
        if (!slides.length) {
            return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    function start() {
        timer = setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            clearInterval(timer);
            show(Number(dot.getAttribute("data-hero-dot") || 0));
            start();
        });
    });

    show(0);
    start();
}

function initLocalFilters() {
    var list = document.querySelector("[data-filter-list]");
    var input = document.querySelector("[data-local-filter]");
    var year = document.querySelector("[data-year-filter]");

    if (!list || (!input && !year)) {
        return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-genre") || ""
            ].join(" ").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var matchTerm = !term || haystack.indexOf(term) !== -1;
            var matchYear = !selectedYear || cardYear === selectedYear;
            card.style.display = matchTerm && matchYear ? "" : "none";
        });
    }

    if (input) {
        input.addEventListener("input", apply);
    }

    if (year) {
        year.addEventListener("change", apply);
    }
}

function initSearchPage() {
    var results = document.getElementById("search-results");
    var status = document.getElementById("search-status");
    var input = document.getElementById("search-input");
    var defaults = document.getElementById("search-default");

    if (!results || typeof SEARCH_MOVIES === "undefined") {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (input) {
        input.value = query;
    }

    if (!query) {
        return;
    }

    var lower = query.toLowerCase();
    var matches = SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase().indexOf(lower) !== -1;
    });

    if (defaults) {
        defaults.style.display = "none";
    }

    if (status) {
        status.classList.add("is-visible");
        status.textContent = matches.length ? "搜索结果：" + query + "，相关影片 " + matches.length + " 条" : "未找到相关影片：" + query;
    }

    results.innerHTML = matches.slice(0, 300).map(function (movie) {
        return [
            '<a class="movie-card" href="./movies/' + movie.file + '" data-title="' + escapeAttr(movie.title) + '" data-region="' + escapeAttr(movie.region) + '" data-year="' + movie.year + '" data-genre="' + escapeAttr(movie.genre) + '">',
            '    <figure class="poster-wrap">',
            '        <img src="./' + movie.cover + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
            '        <span class="poster-year">' + movie.year + '</span>',
            '        <span class="play-hover">▶</span>',
            '    </figure>',
            '    <div class="movie-card-body">',
            '        <h3>' + escapeHtml(movie.title) + '</h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '        <div class="tag-line">' + movie.tags.split(" ").slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
            '    </div>',
            '</a>'
        ].join("\n");
    }).join("\n");
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}

function initPlayer(source) {
    var video = document.getElementById("main-video");
    var overlay = document.getElementById("play-overlay");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        video.controls = true;
    }

    function play() {
        load();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (!loaded) {
            play();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
