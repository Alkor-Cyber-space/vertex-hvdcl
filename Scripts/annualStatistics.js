/* =========================================================
   ANNUAL STATISTICS (SCOPED MODULE)
========================================================= */
(function () {

  let cachedAnnualData = null;
  let filteredAnnualRows = [];

  /* ==========================
     SUMMARY PAGINATION CONFIG
  ========================== */
  let summaryPage = 1;
  const SUMMARY_PAGE_SIZE = 5;

  /* ==========================
     EXPANDED PAGINATION CONFIG
  ========================== */
  let annualExpandedPage = 1;
  const ANNUAL_PAGE_SIZE = 1;

  /* ==========================
     MOCK API
  ========================== */
  async function fetchAnnualStatistics(filters = {}) {
    await new Promise(res => setTimeout(res, 400));

    const names = ["Binu", "Rahul", "Anil", "Suresh", "Akhil", "Manu", "Nikhil", "Arjun"];
    const locations = ["India, Kerala", "India, Tamil Nadu", "India, Karnataka"];

    return {
      meta: {
        year: filters.year || "2025",
        total_plants: 8
      },
      rows: Array.from({ length: 8 }).map((_, i) => {
        const base = 200 + Math.random() * 200;
        return {
          email: `user${i + 1}@mail.com`,
          name: names[i],
          capacity: [3, 5, 10][i % 3],
          location: locations[i % locations.length],
          yearly_total: Math.round(base * 12),
          monthly_avg: +base.toFixed(1),
          total: Math.round(base * 12 * 5),
          jan: +(base + Math.random() * 20).toFixed(1),
          feb: +(base + Math.random() * 20).toFixed(1),
          mar: +(base + Math.random() * 20).toFixed(1),
          apr: +(base + Math.random() * 20).toFixed(1),
          may: +(base + Math.random() * 20).toFixed(1),
          jun: +(base + Math.random() * 20).toFixed(1),
          jul: +(base + Math.random() * 20).toFixed(1),
          aug: +(base + Math.random() * 20).toFixed(1),
          sep: +(base + Math.random() * 20).toFixed(1),
          oct: +(base + Math.random() * 20).toFixed(1),
          nov: +(base + Math.random() * 20).toFixed(1),
          dec: +(base + Math.random() * 20).toFixed(1),
        };
      })
    };
  }

  /* ==========================
     INIT
  ========================== */
  function initStatisticsAnnual() {
    document.getElementById("btnGenerate")
      ?.addEventListener("click", loadAnnualReport);

    document.getElementById("btnExport")
      ?.addEventListener("click", exportAnnualToExcel);

    document.getElementById("filterLocation")
      ?.addEventListener("input", updateAnnualExportButtonState);

    document.getElementById("filterPlant")
      ?.addEventListener("change", updateAnnualExportButtonState);

    document.getElementById("filterYear")
      ?.addEventListener("change", updateAnnualExportButtonState);
  }

  /* ==========================
     LOAD REPORT
  ========================== */
  async function loadAnnualReport() {
    const year = document.getElementById("filterYear")?.value;
    const location = document.getElementById("filterLocation")?.value.trim().toLowerCase();

    cachedAnnualData = await fetchAnnualStatistics({ year });

    document.getElementById("reportTitle").innerText =
      `${year} Generation Statistics`;

    document.getElementById("totalPlants").innerText =
      `Total Plants: ${cachedAnnualData.meta.total_plants}`;

    filteredAnnualRows = cachedAnnualData.rows.filter(row =>
      !location || row.location.toLowerCase().includes(location)
    );

    summaryPage = 1;
    renderSummaryPaginated();
    updateAnnualExportButtonState();
  }

  /* ==========================
     SUMMARY PAGINATION
  ========================== */
  function renderSummaryPaginated() {
    const start = (summaryPage - 1) * SUMMARY_PAGE_SIZE;
    const end = start + SUMMARY_PAGE_SIZE;

    const pageRows = filteredAnnualRows.slice(start, end);
    renderSummaryTable(pageRows);
    renderSummaryPaginationControls();
  }

  function renderSummaryTable(rows) {
    const tbody = document.getElementById("reportBody");
    tbody.innerHTML = "";

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
      return;
    }

    rows.forEach(r => {
      tbody.innerHTML += `
        <tr>
          <td>${r.email}</td>
          <td>${r.name}</td>
          <td>${r.capacity}</td>
          <td>${r.location}</td>
          <td>${r.yearly_total}</td>
          <td>${r.monthly_avg}</td>
          <td>${r.total}</td>
        </tr>
      `;
    });
  }

  function renderSummaryPaginationControls() {
    const container = document.getElementById("summaryPagination");
    if (!container) return;

    const totalPages = Math.ceil(filteredAnnualRows.length / SUMMARY_PAGE_SIZE);
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = "";
    container.classList.add("summary-pagination");

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.disabled = summaryPage === 1;
    prevBtn.onclick = () => {
      summaryPage--;
      renderSummaryPaginated();
    };

    const info = document.createElement("span");
    info.textContent = `Page ${summaryPage} of ${totalPages}`;

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

  /* ==========================
     EXPORT
  ========================== */
  function updateAnnualExportButtonState() {
    const location = document.getElementById("filterLocation")?.value.trim();
    const plant = document.getElementById("filterPlant")?.value;
    const year = document.getElementById("filterYear")?.value;
    const exportBtn = document.getElementById("btnExport");

    const enable =
      location !== "" &&
      plant !== "" &&
      year !== "" &&
      filteredAnnualRows.length > 0;

    exportBtn.disabled = !enable;
    exportBtn.classList.toggle("btn-export-active", enable);
    exportBtn.classList.toggle("btn-disabled", !enable);
  }

  function exportAnnualToExcel() {
    if (!filteredAnnualRows.length) return;

    const year = document.getElementById("filterYear").value;
    const fileName = `Annual_Generation_${year}.csv`;

    let csv =
      "Email,Name,Capacity,Location,Yearly Total,Monthly Avg,Total,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec\n";

    filteredAnnualRows.forEach(r => {
      csv += `${r.email},${r.name},${r.capacity},"${r.location}",${r.yearly_total},${r.monthly_avg},${r.total},${r.jan},${r.feb},${r.mar},${r.apr},${r.may},${r.jun},${r.jul},${r.aug},${r.sep},${r.oct},${r.nov},${r.dec}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  /* ==========================
     EXPAND OVERLAY (UNCHANGED)
  ========================== */
  function onExpandClick() {
    if (!cachedAnnualData) return;

    annualExpandedPage = 1;
    renderExpanded();
    document.getElementById("expandOverlay")?.classList.remove("hidden");
  }

  function closeExpand() {
    document.getElementById("expandOverlay")?.classList.add("hidden");
  }

  function renderExpanded() {
    const start = (annualExpandedPage - 1) * ANNUAL_PAGE_SIZE;
    const end = start + ANNUAL_PAGE_SIZE;

    renderExpandedTable(filteredAnnualRows.slice(start, end));
    renderExpandedPagination(filteredAnnualRows.length);
  }

  function renderExpandedPagination(total) {
    const box = document.getElementById("expandedPagination");
    if (!box) return;

    const pages = Math.ceil(total / ANNUAL_PAGE_SIZE);
    box.innerHTML = "";

    for (let i = 1; i <= pages; i++) {
      box.innerHTML += `
        <button class="page-btn ${i === annualExpandedPage ? "active" : ""}"
          onclick="changeAnnualPage(${i})">${i}</button>`;
    }
  }

  function changeAnnualPage(page) {
    annualExpandedPage = page;
    renderExpanded();
  }

  function renderExpandedTable(rows) {
    const table = document.getElementById("expandedTable");
    if (!table) return;

    table.innerHTML = `
      <thead>
        <tr class="group-header">
          <th colspan="1">Owner Info</th>
          <th colspan="3">Plant Info</th>
          <th colspan="3">Generation</th>
          <th colspan="12">2025</th>
        </tr>
        <tr class="column-header">
          <th>Email</th>
          <th>Name</th>
          <th>Capacity</th>
          <th>Location</th>
          <th>Yearly Total</th>
          <th>Monthly Avg</th>
          <th>Total</th>
          <th>Jan</th><th>Feb</th><th>Mar</th><th>Apr</th>
          <th>May</th><th>Jun</th><th>Jul</th><th>Aug</th>
          <th>Sep</th><th>Oct</th><th>Nov</th><th>Dec</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.email}</td>
            <td>${r.name}</td>
            <td>${r.capacity}</td>
            <td>${r.location}</td>
            <td>${r.yearly_total}</td>
            <td>${r.monthly_avg}</td>
            <td>${r.total}</td>
            <td>${r.jan}</td><td>${r.feb}</td><td>${r.mar}</td><td>${r.apr}</td>
            <td>${r.may}</td><td>${r.jun}</td><td>${r.jul}</td><td>${r.aug}</td>
            <td>${r.sep}</td><td>${r.oct}</td><td>${r.nov}</td><td>${r.dec}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
  }

  window.initStatisticsAnnual = initStatisticsAnnual;
  window.onExpandClick = onExpandClick;
  window.closeExpand = closeExpand;
  window.changeAnnualPage = changeAnnualPage;

})();
