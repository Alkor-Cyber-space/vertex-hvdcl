document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.querySelectorAll(".tab-btn");
    const container = document.getElementById("subPageContainer");

   function loadPage(page) {
    fetch(page)
        .then(res => res.text())
        .then(html => {
            container.innerHTML = html;

            requestAnimationFrame(() => {

                if (page.includes("Organization")) {
                    initOrganizationPage(); // ✅ THIS FIXES EVERYTHING
                }

                if (page.includes("RolePermissionAdministrator")) {
                    setupRolePermissionEvents();
                }

                if (page.includes("pvPlantOwnership")) {
                    initPvOwnershipPage();
                }

                if (page.includes("accountList")) {
                    initAccountList();
                }
            });
        })
        .catch(err => console.error("Page load error:", err));
}

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            loadPage(tab.dataset.page);
        });
    });

    // 🔹 Default page
    loadPage("Organization.html");
});
