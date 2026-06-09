document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
        });
    }

    setupHeroSlider();
    setupInlineFilters();
    setupSearchPage();
});

function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

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
            showSlide(index + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            showSlide(dotIndex);
            start();
        });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    showSlide(0);
    start();
}

function setupInlineFilters() {
    document.querySelectorAll("[data-card-filter]").forEach(function (form) {
        var input = form.querySelector("input");
        var area = form.closest("main") || document;
        var cards = Array.prototype.slice.call(area.querySelectorAll(".searchable-card"));

        if (!input || cards.length === 0) {
            return;
        }

        input.addEventListener("input", function () {
            var query = normalizeText(input.value);

            cards.forEach(function (card) {
                var text = normalizeText(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre"));
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    });
}

function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page) {
        return;
    }

    var input = page.querySelector("[data-search-input]");
    var region = page.querySelector("[data-region-select]");
    var type = page.querySelector("[data-type-select]");
    var year = page.querySelector("[data-year-select]");
    var status = page.querySelector("[data-search-status]");
    var cards = Array.prototype.slice.call(page.querySelectorAll(".searchable-card"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (input) {
        input.value = initial;
    }

    function apply() {
        var query = normalizeText(input ? input.value : "");
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var shown = 0;

        cards.forEach(function (card) {
            var text = normalizeText(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-genre"));
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
            var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
            var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
            var visible = matchQuery && matchRegion && matchType && matchYear;

            card.classList.toggle("is-hidden", !visible);

            if (visible) {
                shown += 1;
            }
        });

        if (status) {
            status.textContent = shown > 0 ? "已匹配 " + shown + " 部影片" : "暂无匹配影片";
        }
    }

    [input, region, type, year].forEach(function (element) {
        if (element) {
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        }
    });

    apply();
}

function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var source = config.source;
    var hlsInstance = null;

    if (!video || !button || !source) {
        return;
    }

    if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
            } else {
                hlsInstance.destroy();
            }
        });
    } else {
        video.src = source;
    }

    function playVideo() {
        button.classList.add("is-hidden");
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", playVideo);

    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove("is-hidden");
        }
    });
}
