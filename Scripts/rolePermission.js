function setupRolePermissionEvents() {

    const roleContent = document.getElementById("roleContent");
    const roleCard = document.querySelector(".role-card");

    if (!roleContent || !roleCard) {
        console.error("Role Permission DOM not ready");
        return;
    }

    const roleData = {
        admin: {
            title: "[Administrator] Character introduction",
            desc: "Administrator has the whole authority for system management."
        },
        browser: {
            title: "[Browser] Character introduction",
            desc: "Browser can view plant data and reports only."
        },
        tech: {
            title: "[Technician] Character introduction",
            desc: "Technician can monitor plants and perform maintenance."
        }
    };

    // Default content
    roleContent.innerHTML = `
        <p class="section-title">${roleData.admin.title}</p>
        <p class="info-text">${roleData.admin.desc}</p>
    `;

    // ✅ Event delegation (no duplicate listeners)
    roleCard.onclick = (e) => {
        const item = e.target.closest(".role-item");
        if (!item) return;

        document.querySelectorAll(".role-item")
            .forEach(i => i.classList.remove("active"));

        item.classList.add("active");

        const key = item.dataset.role;

        roleContent.innerHTML = `
            <p class="section-title">${roleData[key].title}</p>
            <p class="info-text">${roleData[key].desc}</p>
        `;
    };
}
