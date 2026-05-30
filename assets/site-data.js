(async () => {
  const dataUrl = "data/site-data.json";
  const storageKey = "portfolio-theme";

  function initTheme() {
    const root = document.documentElement;
    const toggle = document.querySelector(".theme-toggle");
    const icon = toggle?.querySelector(".theme-toggle-icon");
    const storage = (() => {
      try {
        return window.localStorage;
      } catch (_) {
        return null;
      }
    })();
    const savedTheme = storage?.getItem(storageKey);
    const preferredTheme =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || preferredTheme;

    function applyTheme(theme) {
      const isDark = theme === "dark";
      root.dataset.theme = theme;
      if (toggle) {
        toggle.setAttribute("aria-pressed", String(isDark));
        toggle.setAttribute("title", isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด");
      }
      if (icon) icon.textContent = isDark ? "☀" : "☾";
    }

    applyTheme(initialTheme);

    toggle?.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        storage?.setItem(storageKey, nextTheme);
      } catch (_) {
        // Theme still changes for this page view if browser storage is unavailable.
      }
      applyTheme(nextTheme);
    });
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll(
      [
        ".hero-copy",
        ".hero-visual",
        ".quick-access a",
        ".cockpit-spotlight",
        ".updates-strip",
        ".section-heading",
        ".section article",
        ".timeline",
        ".drive-embed",
        ".media-follow",
        ".cockpit-hero-copy",
        ".cockpit-preview",
        ".cert-hero > *",
      ].join(", ")
    );

    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    targets.forEach((target, index) => {
      target.classList.add("reveal-on-scroll");
      target.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
      observer.observe(target);
    });
  }

  initTheme();

  async function loadJson(url) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  function loadJsonp(url) {
    return new Promise((resolve) => {
      const callbackName = `portfolioCms_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let cmsUrl;
      try {
        cmsUrl = new URL(url);
      } catch (_) {
        resolve(null);
        return;
      }

      cmsUrl.searchParams.set("callback", callbackName);
      script.src = cmsUrl.toString();
      script.async = true;

      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        resolve(null);
      };

      document.head.appendChild(script);
    });
  }

  function mergeSiteData(base, cms) {
    if (!cms) return base;
    return {
      ...base,
      ...cms,
      site: {
        ...(base.site || {}),
        ...(cms.site || {}),
      },
      links: {
        ...(base.links || {}),
        ...(cms.links || {}),
      },
      learningMediaFolders:
        Array.isArray(cms.learningMediaFolders) && cms.learningMediaFolders.length
          ? cms.learningMediaFolders
          : base.learningMediaFolders,
      latestUpdates:
        Array.isArray(cms.latestUpdates) && cms.latestUpdates.length ? cms.latestUpdates : base.latestUpdates,
    };
  }

  async function loadSiteData() {
    const localData = await loadJson(dataUrl);
    const cmsApiUrl = localData?.site?.cmsApiUrl;
    if (!cmsApiUrl) return localData;

    const cmsData = (await loadJson(cmsApiUrl)) || (await loadJsonp(cmsApiUrl));
    return mergeSiteData(localData, cmsData);
  }

  function updateLinks(links) {
    if (!links) return;
    Object.entries(links).forEach(([key, url]) => {
      document.querySelectorAll(`[data-link="${key}"]`).forEach((el) => {
        el.setAttribute("href", url);
      });
    });
  }

  function folderIcon() {
    const icon = document.createElement("span");
    icon.className = "folder-icon small";
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function renderLearningFolders(folders) {
    if (!Array.isArray(folders) || folders.length === 0) return;

    document.querySelectorAll('[data-render="learning-media-folders"]').forEach((container) => {
      container.replaceChildren(
        ...folders.map((folder) => {
          const link = document.createElement("a");
          link.href = folder.url;
          link.target = "_blank";
          link.rel = "noreferrer";

          const title = document.createElement("strong");
          title.textContent = folder.title;

          link.append(folderIcon(), title);
          return link;
        })
      );
    });

    document.querySelectorAll('[data-render="learning-media-folders-mini"]').forEach((container) => {
      container.replaceChildren(
        ...folders.map((folder) => {
          const link = document.createElement("a");
          link.href = folder.url;
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = folder.title;
          return link;
        })
      );
    });
  }

  function renderUpdates(updates) {
    if (!Array.isArray(updates) || updates.length === 0) return;
    document.querySelectorAll('[data-render="latest-updates"]').forEach((container) => {
      container.replaceChildren(
        ...updates.map((item) => {
          const article = document.createElement("article");
          const date = document.createElement("span");
          const title = document.createElement("h3");
          const detail = document.createElement("p");

          date.textContent = item.date;
          title.textContent = item.title;
          detail.textContent = item.detail;

          article.append(date, title, detail);
          if (item.link) {
            const link = document.createElement("a");
            link.className = "text-link";
            link.href = item.link;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = "เปิดดู";
            article.append(link);
          }
          return article;
        })
      );
    });
  }

  const siteData = await loadSiteData();
  if (siteData) {
    updateLinks(siteData.links);
    renderLearningFolders(siteData.learningMediaFolders);
    renderUpdates(siteData.latestUpdates);
  }

  initScrollReveal();
})();
