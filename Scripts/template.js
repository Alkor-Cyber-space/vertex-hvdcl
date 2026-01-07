console.log("📄 template.js loaded");

// Dummy API
const templateApiResponse = [
    {
        id: 1,
        name: "Daily Energy Report",
        description: "Energy data for selected inverters",
        saveTime: "12-06-2025 15:40",
        operator: "Admin"
    },
    {
        id: 2,
        name: "Monthly Generation",
        description: "Monthly energy generation summary",
        saveTime: "01-06-2025 10:12",
        operator: "Supervisor"
    },
    {
        id: 3,
        name: "Monthly Generation",
        description: "Monthly energy generation summary",
        saveTime: "01-06-2025 10:12",
        operator: "Supervisor"
    },
    {
        id: 4,
        name: "Monthly Generation",
        description: "Monthly energy generation summary",
        saveTime: "01-06-2025 10:12",
        operator: "Supervisor"
    },
    {
        id: 5,
        name: "Monthly Generation",
        description: "Monthly energy generation summary",
        saveTime: "01-06-2025 10:12",
        operator: "Supervisor"
    }
];
let currentPage = 1;
const PAGE_SIZE = 3; // 👈 rows per page (change anytime)
let allTemplates = [];

function fetchTemplates() {
    return new Promise(resolve => {
        setTimeout(() => resolve(templateApiResponse), 300);
    });
}

function renderTemplateTable(data) {
    const tbody = document.getElementById("templateTableBody");

    if (!tbody) {
        console.error("❌ templateTableBody not found");
        return;
    }

    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:20px;">
                    No templates found
                </td>
            </tr>`;
        return;
    }

 data.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>${item.saveTime}</td>
        <td>${item.operator}</td>
        <td>
            <button class="btn-view" data-id="${item.id}">View</button>
            <button class="btn-delete" data-id="${item.id}">Delete</button>
        </td>
    `;

    tbody.appendChild(tr);
});

}

/*  THIS IS IMPORTANT */
function initMyTemplatePage() {
    console.log(" initMyTemplatePage()");
    fetchTemplates().then(data => {
        allTemplates = data;
        currentPage = 1;
        renderPaginatedTemplates();
    });
}
function renderPaginatedTemplates() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const pageData = allTemplates.slice(start, end);
    renderTemplateTable(pageData);

    renderPaginationControls();
}
function renderPaginationControls() {
    const container = document.getElementById("templatePagination");
    if (!container) return;

    const totalPages = Math.ceil(allTemplates.length / PAGE_SIZE);

    container.innerHTML = "";

    // Prev
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        renderPaginatedTemplates();
    };

    // Next
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        currentPage++;
        renderPaginatedTemplates();
    };

    // Page Info
    const info = document.createElement("span");
    info.textContent = `Page ${currentPage} of ${totalPages}`;

    container.appendChild(prevBtn);
    container.appendChild(info);
    container.appendChild(nextBtn);
}

let deleteTargetId = null;

document.addEventListener("click", (e) => {

    // =========================
    // VIEW BUTTON
    // =========================
    if (e.target.classList.contains("btn-view")) {
        const id = Number(e.target.dataset.id);
        const item = allTemplates.find(t => t.id === id);
        if (!item) return;

        document.getElementById("viewName").textContent = item.name;
        document.getElementById("viewDesc").textContent = item.description;
        document.getElementById("viewTime").textContent = item.saveTime;
        document.getElementById("viewOperator").textContent = item.operator;

        document.getElementById("viewTemplateModal")
            .classList.remove("hidden");
    }

    // =========================
    // DELETE BUTTON
    // =========================
    if (e.target.classList.contains("btn-delete")) {
        deleteTargetId = Number(e.target.dataset.id);
        document.getElementById("deleteTemplateModal")
            .classList.remove("hidden");
    }

    // =========================
    // CONFIRM DELETE
    // =========================
    if (e.target.id === "confirmDelete") {
        allTemplates = allTemplates.filter(
            t => t.id !== deleteTargetId
        );

        deleteTargetId = null;
        document.getElementById("deleteTemplateModal")
            .classList.add("hidden");

        renderPaginatedTemplates(); // refresh table
    }

    // =========================
    // CLOSE MODALS
    // =========================
    if (
        e.target.dataset.close !== undefined ||
        e.target.classList.contains("modal-overlay")
    ) {
        document.querySelectorAll(".modal-overlay")
            .forEach(m => m.classList.add("hidden"));
    }
});
