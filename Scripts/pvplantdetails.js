// ============================
// GLOBAL STATE
// ============================
window.PvState = {
    selectedOrganization: null
};

// ============================
// DUMMY API DATA
// ============================
const pvOwnershipData = {
    owners: [
        { name: "DR KASIM", organization: "Vertex", location: ["India", "Kerala", "Kochi"] },
        { name: "RAMESHKUMAR", organization: "Vertex 02", location: ["India", "Tamil Nadu", "Chennai"] },
        { name: "HARIS", organization: "Vertex", location: ["India", "Kerala", "Calicut"] },
        { name: "LATHEEF", organization: "Vertex 03", location: ["UAE", "Dubai"] },
        { name: "BINU", organization: "Vertex 02", location: ["India", "Kerala", "Kochi"] },
        { name: "CAPITAL ASSOCIATES", organization: "Vertex Corporate", location: ["India", "Kerala"] },
        { name: "SHAMSU", organization: "Vertex 02", location: ["UAE", "Abu Dhabi"] }
    ]
};


// ============================
// LOCATION DATA
// ============================
const locationList = {
    Global: ["India", "UAE"],
    India: ["Kerala", "Tamil Nadu"],
    Kerala: ["Kochi", "Calicut"],
    "Tamil Nadu": ["Chennai"],
    UAE: ["Dubai", "Abu Dhabi"]
};
const organizations = [
    "Vertex",
    "Vertex 02",
    "Vertex 03",
    "Vertex Corporate",
    "Vertex 04" // 👈 exists but has no PV plants
];

let locationPath = [];

// ============================
// FILTER ENGINE
// ============================
function applyFilters() {
    const orgValue =
        document.getElementById("organizationSearch")?.value.toLowerCase() || "";
    const nameValue =
        document.getElementById("globalSearch")?.value.toLowerCase() || "";

    return pvOwnershipData.owners.filter(o => {
        const orgMatch = orgValue
            ? o.organization.toLowerCase() === orgValue
            : true;

        const nameMatch = nameValue
            ? o.name.toLowerCase().includes(nameValue)
            : true;

        const locationMatch = locationPath.length
            ? locationPath.every(p => o.location.includes(p))
            : true;

        return orgMatch && nameMatch && locationMatch;
    });
}

// ============================
// MASTER REFRESH
// ============================
function refreshPvPage() {
    const selectedOrg = PvState.selectedOrganization;

    // NEW ORG → ALLOCATION MODE
    if (selectedOrg && !hasAnyOwners(selectedOrg)) {
        renderAllocationView(selectedOrg);
        
        return;
    }

    // NORMAL MODE
    const filtered = applyFilters();
    renderPvOwners(filtered);
}

// ============================
// ORGANIZATION LIST (LEFT)
// ============================
function renderOrganizationList(filter = "") {
    const container = document.getElementById("orgTags");
    if (!container) return;

    container.innerHTML = "";

    organizations
        .filter(org => org.toLowerCase().includes(filter.toLowerCase()))
        .forEach(org => {
            const item = document.createElement("div");
            item.className = "org-item";
            item.textContent = org;

            item.onclick = () => {
                PvState.selectedOrganization = org;
                document.getElementById("organizationSearch").value = org;
                refreshPvPage();
            };

            container.appendChild(item);
        });
}


// ============================
// CHECK IF ORG HAS OWNERS
// ============================
function hasAnyOwners(org) {
    return pvOwnershipData.owners.some(o => o.organization === org);
}



// ============================
// ALLOCATION VIEW (🔥 NEW)
// ============================
function renderAllocationView(orgName) {
    // Header title
    document.getElementById("pvHeader").textContent = orgName;

    // Toggle views
    document.getElementById("pvList").classList.add("hidden");
    document.getElementById("pvAllocation").classList.remove("hidden");

    const notAllocated = document.getElementById("notAllocatedList");
    const allocated = document.getElementById("allocatedList");

    if (!notAllocated || !allocated) return;

    notAllocated.innerHTML = "";
    allocated.innerHTML = "";

    getAllPlants().forEach(p => {
        const div = document.createElement("div");
        div.className = "plant-item";
        div.textContent = p;
        notAllocated.appendChild(div);
    });

    document.getElementById("notAllocatedCount").textContent =
        notAllocated.children.length;

    document.getElementById("allocatedCount").textContent = 0;
}

// ============================
// ALL PLANTS (SYSTEM WIDE)
// ============================
function getAllPlants() {
    return [
        "DR KASIM",
        "SHANAVAS",
        "UNNI",
        "RAMESHKUMAR",
        "MAKKAL",
        "Biju Ramachandran",
        "HARIS",
        "MOHAMMAD",
        "LATHEEF",
        "KRISHNAN"
    ];
}

// ============================
// LOCATION DROPDOWN
// ============================
function initLocationDropdown() {
    const locationInput = document.getElementById("locationInput");
    const dropdown = document.getElementById("locationDropdown");

    if (!locationInput || !dropdown) return;

    locationInput.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.remove("hidden");
        renderLevel(locationPath.at(-1) || "Global");
    });

    document.addEventListener("click", () => dropdown.classList.add("hidden"));

    function renderLevel(level) {
        dropdown.innerHTML = "";

        if (locationPath.length) {
            const back = document.createElement("div");
            back.className = "dropdown-back";
            back.textContent = "← Back";
            back.onclick = () => {
                locationPath.pop();
                renderLevel(locationPath.at(-1) || "Global");
                refreshPvPage();
            };
            dropdown.appendChild(back);
        }

        (locationList[level] || []).forEach(item => {
            const div = document.createElement("div");
            div.className = "dropdown-item";
            div.textContent = item;

            div.onclick = () => {
                locationPath.push(item);
                locationInput.value = locationPath.join(" / ");
                refreshPvPage();
            };

            dropdown.appendChild(div);
        });
    }
}

// ============================
// PV OWNERS LIST (NORMAL VIEW)
// ============================
function renderPvOwners(list) {
        document.getElementById("pvAllocation")?.classList.add("hidden");

    const pvList = document.getElementById("pvList");
    const header = document.getElementById("pvHeader");
    if (!pvList || !header) return;

    pvList.innerHTML = "";
    header.textContent = `Have PV plant : ${list.length}`;

    const cols = 3;
    const perCol = Math.ceil(list.length / cols);

    for (let i = 0; i < cols; i++) {
        const col = document.createElement("div");
        col.className = "pv-col";

        list
            .slice(i * perCol, (i + 1) * perCol)
            .forEach(owner => {
                const p = document.createElement("p");
                p.textContent = owner.name;
                col.appendChild(p);
            });

        pvList.appendChild(col);
    }
}

// ============================
// PAGE INIT
// ============================
function initPvOwnershipPage() {
    renderOrganizationList();
    refreshPvPage();
    initLocationDropdown();

    document
        .getElementById("organizationSearch")
        ?.addEventListener("input", e => {
            PvState.selectedOrganization = e.target.value;
            refreshPvPage();
        });

    document
        .getElementById("globalSearch")
        ?.addEventListener("input", refreshPvPage);
}
// Select / deselect plant item
document.addEventListener("click", function (e) {
    const item = e.target.closest(".plant-item");
    if (!item) return;

    // Clear previous selection in same list
    const list = item.parentElement;
    list.querySelectorAll(".plant-item.selected")
        .forEach(el => el.classList.remove("selected"));

    item.classList.add("selected");
});
// ============================
// ALLOCATION MOVE (ARROWS)
// ============================
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".alloc-btn");
    if (!btn) return;

    const notAllocated = document.getElementById("notAllocatedList");
    const allocated = document.getElementById("allocatedList");

    if (btn.textContent === ">") {
        const selected = notAllocated?.querySelector(".plant-item.selected");
        if (!selected) return;

        selected.classList.remove("selected");
        allocated.appendChild(selected);
    }

    if (btn.textContent === "<") {
        const selected = allocated?.querySelector(".plant-item.selected");
        if (!selected) return;

        selected.classList.remove("selected");
        notAllocated.appendChild(selected);
    }

    updateAllocationCounts();
});
function updateAllocationCounts() {
    document.getElementById("notAllocatedCount").textContent =
        document.getElementById("notAllocatedList").children.length;

    document.getElementById("allocatedCount").textContent =
        document.getElementById("allocatedList").children.length;
}
