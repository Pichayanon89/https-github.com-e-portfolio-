(async () => {
  const dataUrl = "data/site-data.json";

  async function loadSiteData() {
    try {
      const response = await fetch(dataUrl, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
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
          return article;
        })
      );
    });
  }

  const siteData = await loadSiteData();
  if (!siteData) return;

  updateLinks(siteData.links);
  renderLearningFolders(siteData.learningMediaFolders);
  renderUpdates(siteData.latestUpdates);
})();
