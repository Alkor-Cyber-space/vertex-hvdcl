// ============================
// DUMMY HELPERS (API READY)
// ============================

async function fetchAccounts() {
    // 🔥 replace later with real API
    // return fetch("/api/accounts").then(r => r.json());

    return [
        {
            email: "nithin@vertexgroup.in",
            role: "Administrator",
            canDisable: false
        },
        {
            email: "rahul@vertexgroup.in",
            role: "Browser",
            canDisable: true
        },
        {
            email: "admin@hvdc.in",
            role: "Technician",
            canDisable: true
        }
    ];
}

// ============================
// RENDER TABLE
// ============================
function renderAccounts(list) {
    const tbody = document.getElementById("accountTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    list.forEach(acc => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${acc.email}</td>
            <td>....................</td>
            <td>${acc.role}</td>
            <td>
                ${acc.canDisable ? "Disable" : "Unable to Disable"}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ============================
// INIT PAGE
// ============================
async function initAccountList() {
    const tbody = document.getElementById("accountTableBody");
    if (!tbody) return; // 🔒 page not loaded yet

    const accounts = await fetchAccounts();
    renderAccounts(accounts);

    const searchInput = document.getElementById("emailSearch");
    const searchBtn = document.getElementById("searchBtn");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.toLowerCase();
            renderAccounts(
                accounts.filter(a => a.email.toLowerCase().includes(q))
            );
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const q = searchInput.value.toLowerCase();
            renderAccounts(
                accounts.filter(a => a.email.toLowerCase().includes(q))
            );
        });
    }
}

// ============================
// BOOT
// ============================
document.addEventListener("DOMContentLoaded", initAccountList);
