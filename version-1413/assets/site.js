(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero-carousel]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupSearchPage() {
        var holder = document.getElementById("search-results");
        if (!holder || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        var input = document.querySelector(".hero-search input[name='q']");
        if (input) {
            input.value = keyword;
        }
        if (!keyword) {
            holder.innerHTML = '<p class="muted">请输入关键词后查看搜索结果。</p>';
            return;
        }
        var words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
        var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
            var haystack = [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.tags,
                item.oneLine
            ].join(" ").toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 80);

        if (!matches.length) {
            holder.innerHTML = '<p class="muted">没有找到相关影片，请更换关键词再试。</p>';
            return;
        }

        holder.innerHTML = '<div class="section-heading"><div><span class="eyebrow dark">Search Result</span><h2>搜索结果</h2></div><span class="muted">' + matches.length + ' 条相关内容</span></div>' +
            '<div class="search-result-list">' +
            matches.map(function (item) {
                return '<article class="search-result-item">' +
                    '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>' +
                    '<div><h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>' +
                    '<a class="watch-link" href="' + item.playUrl + '">播放</a>' +
                '</article>';
            }).join("") + '</div>';
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupSearchPage();
    });
}());
