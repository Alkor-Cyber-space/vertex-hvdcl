/* ===============================
   WARRANTY PAGE SCRIPT
   Backend-ready with dummy fallback
================================ */

document.addEventListener("DOMContentLoaded", () => {
  initWarrantyPage();
});

/* ===============================
   INIT
================================ */
function initWarrantyPage() {
  const tbody = document.getElementById("warranty-table-body");

  // 🔒 Safety guard (important for tab-based loading)
  if (!tbody) {
    console.warn("[Warranty] Table not found, skipping init");
    return;
  }

  fetchWarrantyData();
}

/* ===============================
   FETCH DATA
================================ */
function fetchWarrantyData() {
  // DEV MODE: use dummy data only
  renderWarrantyTable(getDummyWarrantyData());
}

/* ===============================
   DUMMY DATA (DEV MODE)
================================ */
function getDummyWarrantyData() {
  return [
    {
      plant_name: "M_250904_00001",
      classification: "Ground-Mounted",
      capacity: "5kW",
      creation_date: "09.04.2025",
      warranty_end_date: "03.01.2025"
    },
    {
      plant_name: "CAPITAL ASSOCIATES",
      classification: "Commercial Rooftop",
      capacity: "10kW",
      creation_date: "08.29.2025",
      warranty_end_date: "08.01.2026"
    },
    {
      plant_name: "Junaid Thalassery",
      classification: "Residential",
      capacity: "15kW",
      creation_date: "02.27.2025",
      warranty_end_date: "02.27.2030"
    }
  ];
}
function getWarrantyStatus(endDateStr) {
  if (!endDateStr) return "normal";

  let day, month, year;

  if (endDateStr.includes(".")) {
    [day, month, year] = endDateStr.split(".");
  } else if (endDateStr.includes("-")) {
    [year, month, day] = endDateStr.split("-");
  } else {
    return "normal";
  }

  const endDate = new Date(year, month - 1, day, 23, 59, 59);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring-soon";
  return "normal";
}


/* ===============================
   RENDER TABLE
================================ */
function renderWarrantyTable(data) {
  const tbody = document.getElementById("warranty-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    showEmptyState();
    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");

const status = getWarrantyStatus(item.warranty_end_date);

row.innerHTML = `
  <td>${item.plant_name || "-"}</td>
  <td>${item.classification || "-"}</td>
  <td>${item.capacity || "-"}</td>
  <td>${item.creation_date || "-"}</td>
  <td class="warranty-date ${status}">
    ${item.warranty_end_date || "-"}
  </td>
`;

    tbody.appendChild(row);
  });
}

/* ===============================
   EMPTY STATE
================================ */
function showEmptyState() {
  const tbody = document.getElementById("warranty-table-body");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; padding:20px; color:#777;">
        No warranty data found
      </td>
    </tr>
  `;
}
