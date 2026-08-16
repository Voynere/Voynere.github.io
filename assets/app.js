(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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

  revealTargets.forEach((el) => {
    el.classList.add("will-reveal");
  });

  const style = document.createElement("style");
  style.textContent = `
    .will-reveal {
      opacity: 0;
      transform: translateY(0.85rem);
      transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );

  revealTargets.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 45, 280)}ms`;
    observer.observe(el);
  });
})();
