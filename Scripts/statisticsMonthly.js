let cachedMonthlyData = null;
let filteredMonthlyRows = [];
let isMonthlyDataLoaded = false; // ✅ ADD THIS

/* ==========================
   PAGINATION CONFIG
========================== */
let expandedPage = 1;
const EXPANDED_PAGE_SIZE = 12; // 👈 rows per page (change anytime)

/* ==========================
   MOCK API
========================== */
async function fetchMonthlyStatistics(filters = {}) {
  console.log("Fetching Monthly Statistics with filters:", filters);
  await new Promise(res => setTimeout(res, 400));

  const names = ["Binu", "Rahul", "Anil surendran j", "Suresh", "Akhil", "Manu", "Nikhil", "Arjun"];
  const locations = [
    "India, Kerala",
    "India, Tamil Nadu,Asia sajkudhp b",
    "India, Karnataka"
  ];

  return {
    meta: {
      month: filters.month || "2025-11",
      total_plants: 14
    },
    rows: Array.from({ length: 8 }).map((_, i) => {
      const base = 9 + Math.random() * 4;

      return {
        email: `user${i + 1}@mail.com`,
        name: names[i % names.length],
        capacity: [3, 5, 10][i % 3],
        location: locations[i % locations.length],

        monthly_total: Math.round(base * 30),
        daily_avg: +(base.toFixed(1)),
        total: Math.round(base * 30 * 7),

        ...Object.fromEntries(
          Array.from({ length: 31 }, (_, d) => [
            `day_${String(d + 1).padStart(2, "0")}`,
            +(base + Math.random()).toFixed(1)
          ])
        )
      };
    })
  };
}

/* ==========================
   INIT
========================== *//* ==========================
   SUMMARY TABLE PAGINATION
========================== */
let summaryPage = 1;
const SUMMARY_PAGE_SIZE = 5; // 👈 rows per page


function renderSummaryPaginated() {
  const start = (summaryPage - 1) * SUMMARY_PAGE_SIZE;
  const end = start + SUMMARY_PAGE_SIZE;

  const pageRows = filteredMonthlyRows.slice(start, end);
  renderSummaryTable(pageRows);

  renderSummaryPaginationControls();
}

function renderSummaryPaginationControls() {
  const container = document.getElementById("summaryPagination");
  if (!container) return;

  // ✅ ADD THIS LINE (for CSS styling)
  container.classList.add("summary-pagination");

  const totalPages = Math.ceil(filteredMonthlyRows.length / SUMMARY_PAGE_SIZE);
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = "";

  // Prev
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = summaryPage === 1;
  prevBtn.onclick = () => {
    summaryPage--;
    renderSummaryPaginated();
  };

  // Page Info
  const info = document.createElement("span");
  info.textContent = `Page ${summaryPage} of ${totalPages}`;

  // Next
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = summaryPage === totalPages;
  nextBtn.onclick = () => {
    summaryPage++;
    renderSummaryPaginated();
  };

  container.appendChild(prevBtn);
  container.appendChild(info);
  container.appendChild(nextBtn);
}


async function initStatisticsMonthly() {
  console.log("Statistics Monthly Initialized");

  document.getElementById("btnGenerate")
    ?.addEventListener("click", loadMonthlyReport);
  document.getElementById("btnExport")
    ?.addEventListener("click", exportMonthlyToExcel);
document.getElementById("filterLocation")
  ?.addEventListener("input", updateExportButtonState);

document.getElementById("filterPlant")
  ?.addEventListener("change", updateExportButtonState);

document.getElementById("filterMonth")
  ?.addEventListener("change", updateExportButtonState);

  /* =========================
     MONTH INPUT PLACEHOLDER FIX
  ========================= */
  const monthInput = document.getElementById("filterMonth");
  if (monthInput) {
    monthInput.addEventListener("change", () => {
      if (monthInput.value) {
        monthInput.setAttribute("value", monthInput.value);
      } else {
        monthInput.removeAttribute("value");
      }
    });
  }

  loadMonthlyReport();
}

async function loadMonthlyReport() {
  const filters = {
    location: document.getElementById("filterLocation")?.value.trim().toLowerCase() || "",
    plant: document.getElementById("filterPlant")?.value || "",
    month: document.getElementById("filterMonth")?.value || ""
  };

  cachedMonthlyData = await fetchMonthlyStatistics(filters);
  isMonthlyDataLoaded = true;

  document.getElementById("reportTitle").innerText =
    `${filters.month ? filters.month.replace("-", ".") : "—"} Generation Statistics`;

  document.getElementById("totalPlants").innerText =
    `Total Plants: ${cachedMonthlyData.meta.total_plants}`;

  filteredMonthlyRows = cachedMonthlyData.rows.filter(row => {
    const matchLocation =
      !filters.location || row.location.toLowerCase().includes(filters.location);
    return matchLocation;
  });

  /* ✅ PAGINATION ENTRY POINT */
  summaryPage = 1;
  renderSummaryPaginated();

  updateExportButtonState();
}

/* ==========================
   SUMMARY TABLE
========================== */
function renderSummaryTable(rows) {
  const tbody = document.getElementById("reportBody");
  tbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `
      <tr class="no-data">
        <td colspan="7">No data</td>
      </tr>
    `;
    return;
  }

  rows.forEach(row => {
    tbody.innerHTML += `
      <tr>
        <td>${row.email}</td>
        <td>${row.name}</td>
        <td>${row.capacity}</td>
        <td>${row.location}</td>
        <td>${row.monthly_total}</td>
        <td>${row.daily_avg}</td>
        <td>${row.total}</td>
      </tr>
    `;
  });
}


/* ==========================
   EXPAND OVERLAY
========================== */
function onMonthlyExpandClick() {
  if (!isMonthlyDataLoaded) {
    alert("Please generate the report first.");
    return;
  }

  expandedPage = 1;

  const month = document.getElementById("filterMonth")?.value || "";
  const monthLabel = month ? month.replace("-", ".") + " (kWh)" : "—";

  renderExpandedPaginated();
  document.getElementById("expandOverlay").classList.remove("hidden");
}




function closeExpand() {
  document.getElementById("expandOverlay").classList.add("hidden");
}

/* ==========================
   EXPANDED PAGINATION LOGIC
========================== */
function renderExpandedPaginated() {
  const rows = filteredMonthlyRows;

  if (!rows || rows.length === 0) {
    document.getElementById("expandedTable").innerHTML = `
      <tbody>
        <tr><td colspan="40">No data</td></tr>
      </tbody>
    `;
    document.getElementById("expandedPagination").innerHTML = "";
    return;
  }

  const start = (expandedPage - 1) * EXPANDED_PAGE_SIZE;
  const end = start + EXPANDED_PAGE_SIZE;

  const pageRows = rows.slice(start, end);

  renderExpandedTable(pageRows);
  renderExpandedPagination(rows.length);
}


function changeExpandedPage(page) {
  expandedPage = page;
  renderExpandedPaginated();
}

function renderExpandedPagination(totalRows) {
  const container = document.getElementById("expandedPagination");
  if (!container) return;

  const totalPages = Math.ceil(totalRows / EXPANDED_PAGE_SIZE);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `
    <button ${expandedPage === 1 ? "disabled" : ""}
      onclick="changeExpandedPage(${expandedPage - 1})">
      Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="${i === expandedPage ? "active" : ""}"
        onclick="changeExpandedPage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button ${expandedPage === totalPages ? "disabled" : ""}
      onclick="changeExpandedPage(${expandedPage + 1})">
      Next
    </button>
  `;

  container.innerHTML = html;
}

/* ==========================
   EXPANDED TABLE RENDER
========================== */
function renderExpandedTable(rows, monthLabel = "12.2025 (kWh)") {
  const table = document.getElementById("expandedTable");

  let thead = `
    <thead>
      <tr class="group-header">
        <th colspan="1">Owner Info</th>
        <th colspan="3">Plant Info</th>
        <th colspan="1">Generation (kWh)</th>
        <th colspan="31">${monthLabel}</th>
      </tr>
      <tr class="column-header">
        <th>Email</th>
        <th>Name</th>
        <th>Capacity</th>
        <th>Location</th>
        <th>Total</th>
  `;

  for (let d = 1; d <= 31; d++) {
    thead += `<th>${String(d).padStart(2, "0")}</th>`;
  }

  thead += `</tr></thead>`;

  let tbody = "<tbody>";

  rows.forEach(row => {
    tbody += `
      <tr>
        <td>${row.email}</td>
        <td>${row.name}</td>
        <td>${row.capacity}</td>
        <td class="location-cell" data-location="${row.location}">
          ${row.location}
        </td>
        <td>${row.total}</td>
    `;

    for (let d = 1; d <= 31; d++) {
      const key = `day_${String(d).padStart(2, "0")}`;
      tbody += `<td>${row[key] ?? "-"}</td>`;
    }

    tbody += "</tr>";
  });

  tbody += "</tbody>";

  table.innerHTML = thead + tbody;
}

/* ==========================
   LOCATION SEARCH (UNCHANGED)
========================== */
const MOCK_LOCATIONS = [
  "India, Kerala",
  "India, Tamil Nadu",
  "India, Karnataka",
  "India, Andhra Pradesh",
  "India, Telangana",
  "UAE, Dubai",
  "UAE, Abu Dhabi"
];

function onLocationSearch(query) {
  const resultsBox = document.getElementById("locationResults");

  if (!query || query.length < 2) {
    resultsBox.classList.add("hidden");
    resultsBox.innerHTML = "";
    return;
  }

  const matches = MOCK_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  if (matches.length === 0) {
    resultsBox.innerHTML = "<div>No results</div>";
    resultsBox.classList.remove("hidden");
    return;
  }

  resultsBox.innerHTML = matches
    .map(loc => `<div onclick="selectLocation('${loc}')">${loc}</div>`)
    .join("");

  resultsBox.classList.remove("hidden");
}

function selectLocation(value) {
  document.getElementById("filterLocation").value = value;
  document.getElementById("locationResults").classList.add("hidden");
}
function updateExportButtonState() {
  const location = document.getElementById("filterLocation")?.value.trim();
  const plant = document.getElementById("filterPlant")?.value;
  const month = document.getElementById("filterMonth")?.value;
  const exportBtn = document.getElementById("btnExport");

  const allFiltersSelected =
    location !== "" &&
    plant !== "" &&
    month !== "" &&
    filteredMonthlyRows.length > 0;

  if (allFiltersSelected) {
    exportBtn.disabled = false;
    exportBtn.classList.remove("btn-disabled");
    exportBtn.classList.add("btn-export-active"); // ✅ GREEN
  } else {
    exportBtn.disabled = true;
    exportBtn.classList.remove("btn-export-active");
    exportBtn.classList.add("btn-disabled"); // ❌ GREY
  }
}


function exportMonthlyToExcel() {
  if (!filteredMonthlyRows || filteredMonthlyRows.length === 0) {
    alert("No data to export");
    return;
  }

  const month = document.getElementById("filterMonth")?.value || "monthly";
  const fileName = `Monthly_Generation_${month}.csv`;

  let csv = "";

  // Header row
  csv += [
    "Email",
    "Name",
    "Capacity (kW)",
    "Location",
    "Monthly Total",
    "Daily Average",
    "Total"
  ].join(",") + "\n";

  // Data rows
  filteredMonthlyRows.forEach(row => {
    csv += [
      row.email,
      row.name,
      row.capacity,
      `"${row.location}"`,
      row.monthly_total,
      row.daily_avg,
      row.total
    ].join(",") + "\n";
  });

  // Download CSV (Excel compatible)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

