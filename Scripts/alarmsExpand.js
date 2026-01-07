/* ============================
   MOCK API
============================ */
function fetchAlarms() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    plant: "Hyfa",
                    sn: "58000DTS219W02269",
                    inverter: "GOODWE",
                    deviceType: "Inverter",
                    alarm: "1.273kWh/kWp",
                    faultLevel: "Prompt",
                    faultClass: "Operating Condition L...",
                    status: "Happening",
                    time: "11.04.2025 10:09:17",
                    organization_code: "vertex",
                    location: ["India", "Kerala", "Kochi"],
                    starred: false,
                    reasons: [
                        "Safety country of inverter is set wrong.",
                        "Grid voltage is too unstable."
                    ],
                    troubleshooting: [
                        "Check ground wire",
                        "Verify grid voltage"
                    ]
                },
                {
                    id: 2,
                    plant: "YOSUF V T",
                    sn: "58000DTS219W02269",
                    inverter: "GW5000-DNS",
                    deviceType: "Inverter",
                    alarm: "1.08kWh/kWp",
                    faultLevel: "Fault",
                    faultClass: "Production Events",
                    status: "Happening",
                    time: "11.04.2025 10:09:17",
                    organization_code: "vertex2",
                    location: ["India", "Tamil Nadu", "Chennai"],
                    starred: false,
                    reasons: [
                        "Grid frequency abnormal",
                        "Utility power unstable"
                    ],
                    troubleshooting: [
                        "Wait for grid recovery",
                        "Contact utility provider"
                    ]
                },
                {
                    id: 3,
                    plant: "Junaid Thalassery",
                    sn: "58000DTS219W02269",
                    inverter: "GW15K-SDT-30",
                    deviceType: "Inverter",
                    alarm: "1.273kWh/kWp",
                    faultLevel: "Alarm",
                    faultClass: "Operating Condition L...",
                    status: "Happening",
                    time: "11.04.2025 10:09:17",
                    organization_code: "vertex",
                    location: ["India", "Kerala", "Thalassery"],
                    starred: false,
                    reasons: [
                        "PE wire disconnected",
                        "Ground resistance high"
                    ],
                    troubleshooting: [
                        "Reconnect PE wire",
                        "Measure earth resistance"
                    ]
                }
            ]);
        }, 300);
    });
}

/* ============================
   LOCATION TREE
============================ */
const locationList = {
    Global: ["India", "UAE"],
    India: ["Kerala", "Tamil Nadu"],
    Kerala: ["Kochi", "Calicut", "Thalassery"],
    "Tamil Nadu": ["Chennai"],
    UAE: ["Dubai", "Abu Dhabi"]
};

let locationPath = [];

/* ============================
   STATE
============================ */
let allAlarms = [];
let cachedAlarms = [];
let currentPage = 1;
const PAGE_SIZE = 12;

/* ============================
   INIT
============================ */
document.addEventListener("DOMContentLoaded", async () => {
    allAlarms = await fetchAlarms();
    cachedAlarms = [...allAlarms];

    populateOrgCodes(allAlarms);
    initLocationDropdown();
    bindFilters();

    renderPaginatedAlarms();
});

/* ============================
   ORG CODE DROPDOWN
============================ */
function populateOrgCodes(data) {
    const select = document.getElementById("org-code-filter");
    if (!select) return;

    const codes = [...new Set(data.map(d => d.organization_code))];
    select.innerHTML = `<option value="">Organization Code</option>`;

    codes.forEach(code => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = code.toUpperCase();
        select.appendChild(opt);
    });
}

/* ============================
   LOCATION DROPDOWN (DRILL)
============================ */
function initLocationDropdown() {
    const input = document.getElementById("locationInput");
    const dropdown = document.getElementById("locationDropdown");
    if (!input || !dropdown) return;

    input.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.remove("hidden");
        renderLevel(locationPath.at(-1) || "Global");
    });

    document.addEventListener("click", () => dropdown.classList.add("hidden"));
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
                applyFilters();
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
                applyFilters();
            };
            dropdown.appendChild(div);
        });
    }
}

/* ============================
   FILTERS
============================ */
function bindFilters() {
    [
        "filter-status",
        "filter-level",
        "filter-device",
        "filter-classification",
        "org-code-filter"
    ].forEach(id =>
        document.getElementById(id)?.addEventListener("change", applyFilters)
    );

    document
        .getElementById("btn-filter-confirm")
        ?.addEventListener("click", applyFilters);
}

function applyFilters() {
    const status = document.getElementById("filter-status")?.value;
    const level = document.getElementById("filter-level")?.value;
    const device = document.getElementById("filter-device")?.value;
    const classification = document.getElementById("filter-classification")?.value;
    const org = document.getElementById("org-code-filter")?.value;
    const keyword = document.getElementById("search-input")?.value
        .toLowerCase().trim();

    cachedAlarms = allAlarms.filter(item => {
        const matchFilters =
            (!status || item.status === status) &&
            (!level || item.faultLevel === level) &&
            (!device || item.deviceType === device) &&
            (!org || item.organization_code === org) &&
            (!classification || item.faultClass.includes(classification));

        const matchSearch =
            !keyword ||
            item.plant.toLowerCase().includes(keyword) ||
            item.sn.toLowerCase().includes(keyword) ||
            item.inverter.toLowerCase().includes(keyword);

        const matchLocation =
            !locationPath.length ||
            locationPath.every(l => item.location.includes(l));

        return matchFilters && matchSearch && matchLocation;
    });

    currentPage = 1;
    renderPaginatedAlarms();
}
function searchPlants() {
    const keyword = document
        .getElementById("search-input")
        ?.value
        .trim()
        .toLowerCase();

    // Re-apply dropdown filters first
    applyFilters();

    if (!keyword) return;

    cachedAlarms = cachedAlarms.filter(item => {
        return (
            item.plant.toLowerCase().includes(keyword) ||
            item.sn.toLowerCase().includes(keyword) ||
            item.inverter.toLowerCase().includes(keyword)
        );
    });

    currentPage = 1;
    renderPaginatedAlarms();
}

/* ============================
   PAGINATION
============================ */
function renderPaginatedAlarms() {
    const start = (currentPage - 1) * PAGE_SIZE;
    renderAlarmRows(cachedAlarms.slice(start, start + PAGE_SIZE));
    renderPaginationControls();
}

function renderPaginationControls() {
    const el = document.getElementById("pagination");
    if (!el) return;

    const pages = Math.ceil(cachedAlarms.length / PAGE_SIZE);
    el.innerHTML = "";

    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "active" : "";
        btn.onclick = () => {
            currentPage = i;
            renderPaginatedAlarms();
        };
        el.appendChild(btn);
    }
}

/* ============================
   TABLE RENDER
============================ */
function renderAlarmRows(data) {
    const tbody = document.getElementById("alarmTableBody");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML =
            `<tr><td colspan="11" style="text-align:center;">No alarms found</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.dataset.reasons = JSON.stringify(item.reasons || []);
        tr.dataset.troubleshoot = JSON.stringify(item.troubleshooting || []);
        tr.dataset.starred = item.starred;

        tr.innerHTML = `
            <td>${item.plant}</td>
            <td>${item.sn}</td>
            <td>${item.inverter}</td>
            <td>${item.deviceType}</td>
            <td>${item.alarm}</td>
            <td>${item.faultLevel}</td>
            <td>${item.faultClass}</td>
            <td>${item.status}</td>
            <td>${item.time}</td>
            <td><img src="../Asset/Icon Search.png" class="expand-btn"></td>
            <td><span class="star-btn">${item.starred ? "★" : "☆"}</span></td>
        `;
        tbody.appendChild(tr);
    });

    bindExpandHandlers();
    bindStarHandlers();
}



function renderAlarmChart(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            datasets: [{
                label: "Power (W)",
                data: [120, 180, 160, 220, 260, 240, 300, 320, 310, 350],
                borderColor: "#19a974",
                tension: 0.4,
                fill: false,            // ✅ REMOVE fill
                pointRadius: 0,
                borderWidth: 2
            }]

        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: "Time" },
                    grid: { display: false }
                },
                y: {
                    title: { display: true, text: "Power(W)" },
                    grid: { color: "#eee" }
                }
            }
        }
    });
}
function bindStarHandlers() {
    document.querySelectorAll(".star-btn").forEach(star => {
        star.onclick = function () {
            const row = this.closest("tr");

            const isActive = this.classList.toggle("active");
            this.innerText = isActive ? "★" : "☆";

            // save state on row (later → backend)
            row.dataset.starred = isActive;

            console.log(
                "Star toggled:",
                row.children[0].innerText,
                isActive
            );
        };
    });
}
function bindExpandHandlers() {
    document.querySelectorAll(".expand-btn").forEach(btn => {
        btn.onclick = function () {

            const row = this.closest("tr");

            // Close other expanded rows
            document.querySelectorAll(".expanded-row").forEach(r => r.remove());

            // Toggle close
            if (row.nextElementSibling?.classList.contains("expanded-row")) {
                row.nextElementSibling.remove();
                return;
            }

            const reasons = JSON.parse(row.dataset.reasons || "[]");
            const troubleshooting = JSON.parse(row.dataset.troubleshoot || "[]");

            // ✅ CREATE expand row FIRST
            const expandRow = document.createElement("tr");
            expandRow.className = "expanded-row";

            expandRow.innerHTML = `
        <td colspan="10">

          <div class="expanded-content">

            <div class="graph-box">
              <canvas class="alarm-chart"></canvas>
            </div>

            <div class="details">
              <p><strong>${row.children[0].innerText}</strong></p>
              <p>${row.children[1].innerText}</p>
              <p>${row.children[2].innerText}</p>
              <p>${row.children[3].innerText}</p>
              <p>${row.children[5].innerText}</p>
              <p>${row.children[6].innerText}</p>
              <p>Occurrence: ${row.children[7].innerText}</p>
              <p>Recovery: --</p>
            </div>

            <div class="reasons">
              <span>Possible Reasons:</span>
              ${reasons.length
                    ? `<ol>${reasons.map(r => `<li>${r}</li>`).join("")}</ol>`
                    : `<p>—</p>`
                }
            </div>

          </div>

          <div class="troubleshooting">
            <span>Troubleshooting:</span>
            ${troubleshooting.length
                    ? `<ol>${troubleshooting.map(t => `<li>${t}</li>`).join("")}</ol>`
                    : `<p>—</p>`
                }
          </div>

          <div class="history-btn-row">
            <button class="history-btn">History Curve</button>

            <span class="expand-star ${row.dataset.starred === "true" ? "active" : ""}">
              ${row.dataset.starred === "true" ? "★" : "☆"}
            </span>
          </div>

        </td>
      `;

            // ✅ INSERT into DOM
            row.insertAdjacentElement("afterend", expandRow);

            // ✅ RENDER GRAPH
            renderAlarmChart(expandRow.querySelector(".alarm-chart"));
            const historyBtn = expandRow.querySelector(".history-btn");

            historyBtn.onclick = () => {
                const plant = row.children[0].innerText.trim();
                const sn = row.children[1].innerText.trim();
                const inverter = row.children[2].innerText.trim();

                // build query params
                const url = `plantDetail.html?plant=${encodeURIComponent(plant)}&sn=${encodeURIComponent(sn)}&inverter=${encodeURIComponent(inverter)}`;

                window.location.href = url;
            };
            // ✅ STAR SYNC LOGIC (AFTER DOM INSERTION)
            const expandStar = expandRow.querySelector(".expand-star");
            const tableStar = row.querySelector(".star-btn");

            expandStar.onclick = () => {
                const isActive = expandStar.classList.toggle("active");
                expandStar.innerText = isActive ? "★" : "☆";

                // sync state
                row.dataset.starred = isActive;

                // update main table star
                tableStar.classList.toggle("active", isActive);
                tableStar.innerText = isActive ? "★" : "☆";

                console.log("Focused:", row.children[0].innerText, isActive);
            };
        };
    });
}




