(function() {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  const filterRoot = document.querySelector("[data-filter-root]");
  if (filterRoot) {
    const input = filterRoot.querySelector("[data-filter-input]");
    const year = filterRoot.querySelector("[data-filter-year]");
    const type = filterRoot.querySelector("[data-filter-type]");
    const region = filterRoot.querySelector("[data-filter-region]");
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery && input) {
      input.value = initialQuery;
    }
    function match(card) {
      const q = input ? input.value.trim().toLowerCase() : "";
      const y = year ? year.value : "";
      const t = type ? type.value : "";
      const r = region ? region.value : "";
      const haystack = [
        card.dataset.title || "",
        card.dataset.year || "",
        card.dataset.region || "",
        card.dataset.type || "",
        card.dataset.genre || "",
        card.dataset.tags || ""
      ].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) &&
        (!y || card.dataset.year === y) &&
        (!t || card.dataset.type === t) &&
        (!r || card.dataset.region === r);
    }
    function apply() {
      cards.forEach(function(card) {
        card.hidden = !match(card);
      });
    }
    [input, year, type, region].forEach(function(el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }
})();
