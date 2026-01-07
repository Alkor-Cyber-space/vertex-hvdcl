document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".settings-sidebar .menu-item");
  const menuGroups = document.querySelectorAll(".settings-sidebar .menu-group");
  const contentBox = document.getElementById("settingsContent");

  /**
   * Load settings page content
   */
  function loadPage(page) {
    fetch(`../Components/settings/${page}`)
      .then(res => res.text())
      .then(html => {
        // Inject HTML
        contentBox.innerHTML = html;

        //  Remove any previously loaded page-specific script
        const oldScript = document.getElementById("page-script");
        if (oldScript) oldScript.remove();

        //  Load JS only for specific pages
        if (page === "messageForOwner.html") {
          const script = document.createElement("script");
          script.src = "../Scripts/alarmOwner.js";
          script.id = "page-script";
          script.defer = true;
          document.body.appendChild(script);
        }
      })
      .catch(err => {
        console.error("Failed to load page:", err);
        contentBox.innerHTML =
          "<p style='padding:20px'>Failed to load page</p>";
      });
  }

  // Default page on first load
  loadPage("myMessage.html");

  // Sidebar click handling
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      menuGroups.forEach(g => g.classList.remove("active"));

      item.classList.add("active");

      // Activate its parent menu group (if any)
      const parentGroup = item.closest(".menu-group");
      if (parentGroup) parentGroup.classList.add("active");

      // Load the corresponding page
      const page = item.dataset.page;
      if (page) loadPage(page);
    });
  });
});
