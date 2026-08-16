(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  const setNavOpen = (open) => {
    document.body.classList.toggle("nav-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
  };

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 721px)").matches) {
        setNavOpen(false);
      }
    });
  }

  const harbor = document.querySelector(".harbor");
  if (harbor && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const lines = harbor.querySelectorAll(".harbor-line");
    harbor.addEventListener("pointermove", (event) => {
      const rect = harbor.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      lines.forEach((line, index) => {
        const strength = (index + 1) * 4;
        line.style.translate = `${x * strength}px ${y * strength * 0.35}px`;
      });
    });
    harbor.addEventListener("pointerleave", () => {
      lines.forEach((line) => {
        line.style.translate = "";
      });
    });
  }

  const revealTargets = document.querySelectorAll(
    ".project, .note, .facts > div, .contact-item, .section-head"
  );
  if (!("IntersectionObserver" in window) || revealTargets.length === 0) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    .will-reveal {
      opacity: 0;
      transform: translateY(0.7rem);
      transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .will-reveal.is-visible {
      opacity: 1;
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .will-reveal {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  revealTargets.forEach((el) => el.classList.add("will-reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );

  revealTargets.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 35, 220)}ms`;
    observer.observe(el);
  });
})();
