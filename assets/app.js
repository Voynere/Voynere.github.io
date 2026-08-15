(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const revealTargets = document.querySelectorAll(".project, .facts > div, .section-head");
  if (!("IntersectionObserver" in window) || revealTargets.length === 0) {
    return;
  }

  revealTargets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(0.7rem)";
    el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
    observer.observe(el);
  });
})();
