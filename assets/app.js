(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  let lastFocused = null;

  const setNavOpen = (open) => {
    const wasOpen = document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    if (open && !wasOpen) {
      lastFocused = document.activeElement;
      const firstLink = nav?.querySelector("a");
      firstLink?.focus();
    } else if (!open && wasOpen && lastFocused instanceof HTMLElement) {
      lastFocused.focus();
      lastFocused = null;
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
        return;
      }

      if (!document.body.classList.contains("nav-open") || event.key !== "Tab") {
        return;
      }

      const focusables = [toggle, ...nav.querySelectorAll("a")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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

  const sectionIds = ["work", "experience", "blog", "about", "contact"];
  const sectionLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  if (sectionLinks.length && sectionIds.some((id) => document.getElementById(id))) {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const spy = () => {
      const marker = window.scrollY + window.innerHeight * 0.28;
      let current = null;
      sections.forEach((section) => {
        if (section.offsetTop <= marker) {
          current = section.id;
        }
      });
      sectionLinks.forEach((link) => {
        const id = (link.getAttribute("href") || "").slice(1);
        if (current === id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    spy();
    window.addEventListener("scroll", spy, { passive: true });
  }

  const post = document.querySelector("article.post");
  if (post) {
    const rail = document.createElement("div");
    rail.className = "read-progress";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = '<div class="read-progress-bar"></div>';
    document.body.appendChild(rail);
    const bar = rail.querySelector(".read-progress-bar");

    const updateProgress = () => {
      const rect = post.getBoundingClientRect();
      const total = post.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const ratio = total > 0 ? passed / total : 0;
      if (bar) {
        bar.style.transform = `scaleX(${ratio})`;
      }
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  const revealTargets = document.querySelectorAll(
    ".project, .note, .facts > div, .contact-item, .section-head, .experience-item"
  );
  if ("IntersectionObserver" in window && revealTargets.length > 0) {
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
  }

  const searchInput = document.getElementById("blog-search");
  const searchStatus = document.getElementById("blog-search-status");
  const noteItems = [...document.querySelectorAll(".note-list > li")];
  const tagFilters = [...document.querySelectorAll(".tag-filter")];
  let activeTag = "";

  const applyBlogFilters = () => {
    if (!noteItems.length) return;
    const query = (searchInput?.value || "").trim().toLowerCase();
    let visible = 0;
    noteItems.forEach((item) => {
      const hay = item.textContent.toLowerCase();
      const tags = (item.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
      const tagMatch = !activeTag || tags.includes(activeTag);
      const textMatch = !query || hay.includes(query);
      const match = tagMatch && textMatch;
      item.hidden = !match;
      if (match) visible += 1;
    });
    if (!searchStatus) return;
    const parts = [];
    if (activeTag) parts.push(`тег «${activeTag}»`);
    if (query) parts.push(`«${query}»`);
    if (!parts.length) {
      searchStatus.textContent = "";
    } else if (visible === 0) {
      searchStatus.textContent = "Ничего не нашлось";
    } else {
      searchStatus.textContent = `Найдено: ${visible} · ${parts.join(" · ")}`;
    }
  };

  if (searchInput && noteItems.length) {
    searchInput.addEventListener("input", applyBlogFilters);
  }

  if (tagFilters.length && noteItems.length) {
    const params = new URLSearchParams(window.location.search);
    const initialTag = params.get("tag") || "";
    if (initialTag) {
      activeTag = initialTag;
      tagFilters.forEach((btn) => {
        btn.classList.toggle("is-active", (btn.getAttribute("data-tag") || "") === activeTag);
      });
    }

    tagFilters.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTag = btn.getAttribute("data-tag") || "";
        tagFilters.forEach((other) => {
          other.classList.toggle("is-active", other === btn);
        });
        const url = new URL(window.location.href);
        if (activeTag) url.searchParams.set("tag", activeTag);
        else url.searchParams.delete("tag");
        window.history.replaceState({}, "", url);
        applyBlogFilters();
      });
    });
    applyBlogFilters();
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    if (!searchInput) return;
    event.preventDefault();
    searchInput.focus();
  });

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener(
      "pointerenter",
      () => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("/#") || document.querySelector(`link[data-prefetch="${href}"]`)) {
          return;
        }
        const prefetch = document.createElement("link");
        prefetch.rel = "prefetch";
        prefetch.href = href;
        prefetch.dataset.prefetch = href;
        document.head.appendChild(prefetch);
      },
      { once: true }
    );
  });

  document.querySelectorAll(".post-body a[href^='http']").forEach((link) => {
    if (!link.hostname.includes("voynere.github.io")) {
      link.classList.add("is-external");
      if (!link.target) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    }
  });

  const postHeader = document.querySelector("article.post .post-header");
  if (postHeader && navigator.clipboard) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-link";
    button.textContent = "Скопировать ссылку";
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        button.textContent = "Скопировано";
        window.setTimeout(() => {
          button.textContent = "Скопировать ссылку";
        }, 1600);
      } catch {
        button.textContent = "Не удалось";
      }
    });
    postHeader.appendChild(button);
  }

  const postBody = document.querySelector(".post-body");
  if (postBody && postHeader) {
    const headings = [...postBody.querySelectorAll("h2")];
    if (headings.length >= 2) {
      const toc = document.createElement("nav");
      toc.className = "toc";
      toc.setAttribute("aria-label", "Содержание");
      const list = document.createElement("ol");
      headings.forEach((heading, index) => {
        if (!heading.id) {
          heading.id = `section-${index + 1}`;
        }
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent || `Раздел ${index + 1}`;
        item.appendChild(link);
        list.appendChild(item);
      });
      toc.innerHTML = "<p class=\"toc-label\">Содержание</p>";
      toc.appendChild(list);
      postHeader.insertAdjacentElement("afterend", toc);
    }
  }

  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "to-top";
  topBtn.setAttribute("aria-label", "Наверх");
  topBtn.innerHTML = '<span aria-hidden="true">↑</span>';
  document.body.appendChild(topBtn);
  const syncTop = () => {
    topBtn.classList.toggle("is-visible", window.scrollY > 480);
  };
  syncTop();
  window.addEventListener("scroll", syncTop, { passive: true });
  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const shortcuts = document.createElement("div");
  shortcuts.className = "shortcuts";
  shortcuts.setAttribute("role", "dialog");
  shortcuts.setAttribute("aria-modal", "true");
  shortcuts.setAttribute("aria-label", "Горячие клавиши");
  shortcuts.hidden = true;
  shortcuts.innerHTML = `
    <div class="shortcuts-panel">
      <h2>Клавиши</h2>
      <dl>
        <div><dt>/</dt><dd>Поиск в блоге</dd></div>
        <div><dt>?</dt><dd>Эта справка</dd></div>
        <div><dt>Esc</dt><dd>Закрыть меню / справку</dd></div>
      </dl>
      <p class="shortcuts-hint">Нажмите Esc или кликните фон</p>
    </div>
  `;
  document.body.appendChild(shortcuts);

  const setShortcutsOpen = (open) => {
    shortcuts.classList.toggle("is-open", open);
    shortcuts.hidden = !open;
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "?" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const target = event.target;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      event.preventDefault();
      setShortcutsOpen(!shortcuts.classList.contains("is-open"));
      return;
    }
    if (event.key === "Escape") {
      setShortcutsOpen(false);
    }
  });

  shortcuts.addEventListener("click", (event) => {
    if (event.target === shortcuts) {
      setShortcutsOpen(false);
    }
  });
})();
