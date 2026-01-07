/* ===============================
   CONFIG
================================ */
const API_CONFIG = {
  baseURL: "http://localhost:3000/api",
  endpoints: { plants: "/plants" }
};

/* ===============================
   LOCATION TREE (LIKE ALARMS)
================================ */
const locationList = {
  Global: ["India", "UAE"],
  India: ["Kerala", "Tamil Nadu"],
  Kerala: ["Kochi", "Calicut", "Thalassery"],
  "Tamil Nadu": ["Chennai"],
  UAE: ["Dubai", "Abu Dhabi"]
};

let locationPath = [];

/* ===============================
   STATE
================================ */
let allPlants = [];
let filteredPlants = [];

let state = {
  filters: {
    search: "",
    orgCode: "",
    location: [],
    status: "",
     classification: "" 
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0
  }
};
let classificationOrder = [
  "", // all
  "Battery storage",
  "Residential",
  "Commercial rooftop",
  "Ground-Mounted",
  "C&I Energy Storage"
];

let currentClassificationIndex = 0;

/* ===============================
   LOCATION DROPDOWN
================================ */
function initLocationDropdown() {
  const input = document.getElementById("locationInput");
  const dropdown = document.getElementById("locationDropdown");
  if (!input || !dropdown) return;

  input.addEventListener("click", e => {
    e.stopPropagation();
    dropdown.classList.remove("hidden");
    renderLevel(locationPath.at(-1) || "Global");
  });

  document.addEventListener("click", () =>
    dropdown.classList.add("hidden")
  );
  dropdown.addEventListener("click", e => e.stopPropagation());

  function renderLevel(level) {
    dropdown.innerHTML = "";

    if (locationPath.length) {
      const back = document.createElement("div");
      back.className = "dropdown-back";
      back.textContent = "← Back";
      back.onclick = () => {
        locationPath.pop();
        input.value = locationPath.join(" / ") || "Global";
        renderLevel(locationPath.at(-1) || "Global");
        applyPlantFilters();
      };
      dropdown.appendChild(back);
    }

    (locationList[level] || []).forEach(item => {
      const div = document.createElement("div");
      div.className = "dropdown-item";
      div.textContent = item;
      div.onclick = () => {
        locationPath.push(item);
        input.value = locationPath.join(" / ");
        locationList[item]
          ? renderLevel(item)
          : dropdown.classList.add("hidden");
        applyPlantFilters();
      };
      dropdown.appendChild(div);
    });
  }
}

/* ===============================
   STATUS FILTER
================================ */
function filterByStatus(status) {
  state.filters.status = status;
  state.pagination.currentPage = 1;

  document
    .querySelectorAll(".status-item")
    .forEach(i => i.classList.remove("active"));

  if (status) {
    document
      .querySelector(`.status-item[onclick="filterByStatus('${status}')"]`)
      ?.classList.add("active");
  }

  applyPlantFilters();
}

/* ===============================
   SEARCH BUTTON
================================ */
function searchPlants() {
  state.filters.search = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase();

  state.filters.orgCode =
    document.getElementById("org-code-filter")?.value || "";

  state.filters.location = [...locationPath];

  state.pagination.currentPage = 1;
  applyPlantFilters();
}

/* ===============================
   APPLY FILTERS (CORE LOGIC)
================================ */
function applyPlantFilters() {
  filteredPlants = allPlants.filter(p => {
    const matchSearch =
      !state.filters.search ||
      p.name.toLowerCase().includes(state.filters.search) ||
      p.sn?.toLowerCase().includes(state.filters.search) ||
      p.email?.toLowerCase().includes(state.filters.search);

    const matchOrg =
      !state.filters.orgCode ||
      p.orgCode === state.filters.orgCode;

    const matchLocation =
      !state.filters.location.length ||
      state.filters.location.every(l =>
        p.locationPath?.includes(l)
      );

    const matchStatus =
      !state.filters.status ||
      p.status === state.filters.status;

    const matchClassification =
      !state.filters.classification ||
      p.classification === state.filters.classification;

    return (
      matchSearch &&
      matchOrg &&
      matchLocation &&
      matchStatus &&
      matchClassification
    );
  });

  // ✅ AFTER filtering (correct place)
  updateClassificationArrow();

  state.pagination.totalItems = filteredPlants.length;
  renderPlantsTable(paginate(filteredPlants));
  renderPagination(state.pagination);
  updateStatusOverview(filteredPlants);
}
function updateClassificationArrow() {
  const arrow = document.getElementById("classArrow");
  if (!arrow) return;

  arrow.textContent = state.filters.classification ? "▲" : "⇅";
}


function updateStatusOverview(plants) {
  const counts = {
    working: 0,
    fault: 0,
    waiting: 0,
    offline: 0
  };

  plants.forEach(p => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++;
    }
  });

  document.getElementById("count-working").textContent = counts.working;
  document.getElementById("count-fault").textContent = counts.fault;
  document.getElementById("count-waiting").textContent = counts.waiting;
  document.getElementById("count-offline").textContent = counts.offline;
}


/* ===============================
   PAGINATION HELPERS
================================ */
function paginate(list) {
  const start =
    (state.pagination.currentPage - 1) *
    state.pagination.itemsPerPage;

  return list.slice(
    start,
    start + state.pagination.itemsPerPage
  );
}

function previousPage() {
  if (state.pagination.currentPage > 1) {
    state.pagination.currentPage--;
    applyPlantFilters();
  }
}

function nextPage() {
  const totalPages = Math.ceil(
    state.pagination.totalItems /
      state.pagination.itemsPerPage
  );
  if (state.pagination.currentPage < totalPages) {
    state.pagination.currentPage++;
    applyPlantFilters();
  }
}

/* ===============================
   FETCH PLANTS (MOCK)
================================ */
async function fetchPlants(filters, page, limit) {
  return getMockPlantsData(page, limit, filters.status);
}

/* ===============================
   LOAD PLANTS
================================ */
async function loadPlants() {
  const data = await fetchPlants(
    state.filters,
    state.pagination.currentPage,
    state.pagination.itemsPerPage
  );

  allPlants = data.plants.map(p => ({
    ...p,
    locationPath: ["India", "Kerala", p.location] // REQUIRED
  }));

  applyPlantFilters();
}

/* ===============================
   MOCK DATA
================================ */
function getMockPlantsData(page, limit, statusFilter) {
  let plants = [
    {
      id: 1,
      name: "Kashika",
      location: "Thalassery",
      power: "5.75kW",
      capacity: "7.00kW",
      today: "1.27",
      total: "8.90",
      totalYield: "961.6",
      classification: "Battery storage",
      status: "working",
      orgCode: "vertex"
    },
    {
      id: 2,
      name: "Prasanth",
      location: "Kerala",
      power: "1.10kW",
      capacity: "6.00kW",
      today: "1.08",
      total: "6.50",
      totalYield: "9954",
      classification: "Residential",
      status: "fault",
      orgCode: "vertex"
    },
    {
      id: 3,
      name: "Ahamed",
      location: "Thrissur",
      power: "2.00kW",
      capacity: "3.00kW",
      today: "0.80",
      total: "4.20",
      totalYield: "1100",
      classification: "Commercial rooftop",
      status: "waiting",
      orgCode: "vertex2"
    },
    {
      id: 4,
      name: "Zara",
      location: "Palakkad",
      power: "3.75kW",
      capacity: "5.00kW",
      today: "1.11",
      total: "7.33",
      totalYield: "800",
      classification: "Energy Storage",
      status: "offline",
      orgCode: "vertex2"
    }
  ];

  if (statusFilter) {
    plants = plants.filter(p => p.status === statusFilter);
  }

  return {
    plants,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: plants.length
    }
  };
}

/* ===============================
   TABLE RENDER
================================ */
function renderPlantsTable(plants) {
  const tbody = document.querySelector("#plants-table tbody");

  if (!plants.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:40px;">
          No plants found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = plants
    .map(
      p => `
      <tr class="click-row" onclick="goToPlantDetail(${p.id})">
        <td><span class="status-dot ${p.status}"></span> <strong>${p.name}</strong></td>
        <td>${p.location}</td>
        <td><strong>${p.power}</strong></td>
        <td>${p.capacity}</td>
        <td>${p.today}</td>
        <td><strong>${p.total}</strong></td>
        <td>${p.totalYield}</td>
        <td>${p.classification}</td>
      </tr>
    `
    )
    .join("");
}

/* ===============================
   PAGINATION TEXT
================================ */
function renderPagination(pagination) {
  const info = document.querySelector(".table-info");

  const start =
    (pagination.currentPage - 1) *
      pagination.itemsPerPage +
    1;
  const end = Math.min(
    pagination.currentPage * pagination.itemsPerPage,
    pagination.totalItems
  );

  info.textContent = `Showing ${start} to ${end} of ${pagination.totalItems} plants`;
}

/* ===============================
   ROW CLICK
================================ */
function goToPlantDetail(id) {
  window.location.href = `plantdetail.html?id=${id}`;
}

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initLocationDropdown();
  loadPlants();
});
document.addEventListener("DOMContentLoaded", () => {
  const th = document.getElementById("classificationTh");
  const dropdown = document.getElementById("classificationDropdown");

  if (!th || !dropdown) return;

  // Toggle dropdown
  th.querySelector(".class-header").addEventListener("click", e => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  // Option click
  dropdown.querySelectorAll("div").forEach(item => {
    item.addEventListener("click", e => {
      e.stopPropagation();

      state.filters.classification = item.dataset.value;
      state.pagination.currentPage = 1;

      dropdown.classList.add("hidden");
      applyPlantFilters();
    });
  });

  // Close on outside click
  document.addEventListener("click", () => {
    dropdown.classList.add("hidden");
  });
});
