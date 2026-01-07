document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("reportContent");
  const menuItems = document.querySelectorAll(".menu-item");
  const menuGroups = document.querySelectorAll(".menu-group");

  if (!content) {
    console.error("❌ reportContent container not found");
    return;
  }

  /* ======================================================
     1. LOAD DEFAULT PAGE
  ====================================================== */
  loadComponent("dataSelection.html");

  // Set default active item + group
  const defaultItem = document.querySelector(
    '.menu-item[data-page="dataSelection.html"]'
  );

  if (defaultItem) {
    defaultItem.classList.add("active");
    const parentGroup = defaultItem.closest(".menu-group");
    if (parentGroup) parentGroup.classList.add("active");
  }

  /* ======================================================
     2. MENU CLICK HANDLING
  ====================================================== */
  menuItems.forEach(item => {
    item.addEventListener("click", () => {

      const page = item.dataset.page;
      if (!page) return;

      // Remove active states
      menuItems.forEach(i => i.classList.remove("active"));
      menuGroups.forEach(g => g.classList.remove("active"));

      // Activate clicked item
      item.classList.add("active");

      // Activate its group (if any)
      const parentGroup = item.closest(".menu-group");
      if (parentGroup) parentGroup.classList.add("active");

      loadComponent(page);
    });
  });

  /* ======================================================
     3. COMPONENT LOADER (HTML + JS INIT)
  ====================================================== */
  function loadComponent(page) {
    console.log(`[Reports] Loading: ${page}`);

    fetch(`../components/Reports/${page}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${page}`);
        return res.text();
      })
      .then(html => {
        // Inject HTML
        content.innerHTML = html;

        // 🔁 Call page-specific init AFTER HTML injection
        switch (page) {
          case "dataSelection.html":
            if (window.initDataSelection) initDataSelection();
            break;

          case "generationReports.html":
            if (window.initGenerationReports) initGenerationReports();
            break;

          case "monthlyStatistics.html":
            if (window.initStatisticsMonthly) initStatisticsMonthly();
            break;

          case "statisticsAnnual.html":
          case "annualStatistics.html": // safety alias
            if (window.initStatisticsAnnual) initStatisticsAnnual();
            break;

          case "myTemplate.html":
            if (window.initMyTemplatePage) initMyTemplatePage();
            break;

          default:
            console.warn(`⚠️ No init handler for ${page}`);
        }
      })
      .catch(err => {
        console.error(err);
        content.innerHTML = "<p>❌ Failed to load content</p>";
      });
  }
});
