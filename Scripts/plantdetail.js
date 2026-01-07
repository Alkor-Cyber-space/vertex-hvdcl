
const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");
console.log("[INIT] Plant ID:", plantId);
let currentTab = "power";
let currentMode = "day";
let selectedDate = null;
let pvChart = null;
let generationVisible = true;

// ===============================
// CHART ZOOM CONFIG (GLOBAL)
// ===============================
const zoomOptions = {
  pan: {
    enabled: true,
    mode: "x",
    modifierKey: "ctrl"   // Ctrl + drag to pan
  },
  zoom: {
    wheel: {
      enabled: true,
      speed: 0.5          // smooth zoom
    },
    pinch: {
      enabled: true
    },
    mode: "x"
  },
  limits: {
    x: { min: "original", max: "original" },
    y: { min: "original", max: "original" }
  }
  
};


function log(...args) {
  console.log("[DASHBOARD]", ...args);
}

function updateGauge(card, power) {
  const max = Number(card.dataset.max || 300);

  const progressArc = card.querySelector(".gauge-progress");
  const needle = card.querySelector(".gauge-needle");
  const powerText = card.querySelector(".power-text");
  const statusText = card.querySelector(".status-text");

  if (!progressArc || !needle || !powerText || !statusText) {
    console.warn("⚠️ Gauge markup missing:", card);
    return;
  }

  const ARC_LENGTH = 283;
  // Clamp value
  const value = Math.max(0, Math.min(power, max));
  const percent = value / max;
  // Arc fill
  progressArc.style.strokeDashoffset =
    ARC_LENGTH - ARC_LENGTH * percent;
  // Needle rotation (-90° → +90°)
  const angle = percent * 180;
  needle.style.transform = `rotate(${angle}deg)`;
  powerText.textContent = `${value}W`;
  if (value === 0) {
    card.classList.add("offline");
    statusText.textContent = "Offline";
  } else {
    card.classList.remove("offline");
    statusText.textContent = "Working";
  }
}
// CENTRAL GRAPH RELOAD 
function reloadCurrentGraph() {
  log("Reload graph", {
    tab: currentTab,
    mode: currentMode,
    date: selectedDate,
    generationVisible
  });

  if (currentTab === "power") {
    loadPowerGraph();
  } else if (currentTab === "genIncome") {
    loadGenIncomeGraph();
  }
}

// ----------------------
// MAIN DASHBOARD SCRIPT
document.addEventListener("DOMContentLoaded", () => {
  log("DOM loaded");
  loadPowerGraph();

  renderBottomPowerCurve();
  initInverterViews(); // ✅ MOVE IT HERE

  //  INIT GAUGES
  document.querySelectorAll(".gauge-card").forEach(card => {
    const power = Number(card.dataset.power || 0);
    updateGauge(card, power);
  });
});
document.getElementById("genToggle")?.addEventListener("click", () => {
  generationVisible = !generationVisible;
  document.getElementById("genToggle")
    .classList.toggle("off", !generationVisible);
  loadGenIncomeGraph();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentTab !== "genIncome") return;

    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    reloadCurrentGraph();
  });
});

document.getElementById("chartDate")?.addEventListener("change", e => {
  selectedDate = e.target.value;
  reloadCurrentGraph();
});

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    btn.dataset.tab === "power"
      ? loadPowerGraph()
      : loadGenIncomeGraph();
  });
});
// initInverterViews();


// STEP 2 → POWER GRAPH (LINE GRAPH)
function loadPowerGraph() {
  const canvas = document.getElementById("pvChart");
  const ctx = canvas.getContext("2d");

  if (pvChart) pvChart.destroy();

  pvChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["06","07","08","09","10","11"],
      datasets: [{
        label: "Power",
        data: [1, 3, 5, 4, 6, 2],
        borderColor: "#00d5ff",
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
  zoom: {
    pan: {
      enabled: true,
      mode: "x",
      modifierKey: "ctrl"
    },
    zoom: {
      wheel: {
        enabled: true,
        speed: 0.01,        // 🔥 LOWER = SMOOTHER
        modifierKey: null   // allow normal wheel zoom
      },
      pinch: {
        enabled: true
      },
      drag: {
        enabled: false      // keep drag zoom OFF (clean UX)
      },
      mode: "x"
    }
  }
}

    }
  });

  canvas.addEventListener("dblclick", () => pvChart.resetZoom());
}


// DATA PROVIDER (DAY / MONTH / YEAR)
function getGenIncomeData(mode, date) {

  log("Fetching data", { mode, date });

  if (mode === "day") {
    return {
      labels: ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"],
      gen: [5, 8, 12, 15, 9, 6],
      income: [40, 60, 90, 110, 70, 45]
    };
  }

  if (mode === "month") {
    return {
      labels: ["01", "05", "10", "15", "20", "25", "30"],
      gen: [120, 140, 160, 150, 170, 180, 165],
      income: [900, 1100, 1300, 1200, 1400, 1500, 1350]
    };
  }

  // year
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    gen: [800, 950, 1100, 1050, 1200, 1300],
    income: [6500, 7200, 8300, 7900, 9100, 9800]
  };
}
// STEP 3 → GENERATION + INCOME GRAPH
function loadGenIncomeGraph() {

  currentTab = "genIncome";
  log("Rendering GEN & INCOME graph", {
    mode: currentMode,
    date: selectedDate,
    generationVisible
  });

  document.getElementById("genToggle").classList.remove("hidden");
  document.getElementById("timeFilter").classList.remove("hidden");

  const canvas = document.getElementById("pvChart");
  const ctx = canvas.getContext("2d");

  if (pvChart) pvChart.destroy();

  const { labels, gen, income } = getGenIncomeData(currentMode, selectedDate);

  pvChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Generation (kWh)",
          data: generationVisible ? gen : [],
          backgroundColor: generationVisible ? "#4CC7B3" : "transparent",
          borderRadius: 6,
          borderSkipped: false
        },
        {
          type: "line",
          label: "Income (INR)",
          data: income,
          borderColor: "#0078A8",
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y2"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
  legend: { display: false },
  zoom: zoomOptions 
},

      scales: {
        y: { beginAtZero: true, title: { display: true, text: "kWh" } },
        y2: {
          beginAtZero: true,
          position: "right",
          title: { display: true, text: "INR" },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
canvas.ondblclick = () => {
  pvChart?.resetZoom();
};


}
// weather-----------
const API_KEY = "610a288b2caef114f9419eecb84a6878";
const CITY = "Thalassery";
const LAT = 11.7480;
const LON = 75.4929;

function getLocalWeatherIcon(weather, temp) {
  const main = weather.main.toLowerCase();
  const desc = weather.description.toLowerCase();
  const isNight = weather.icon.endsWith("n");

  // Night handling (optional)
  if (isNight) {
    return "../Asset/night.png";
  }

  // CLEAR WEATHER
  if (main === "clear") {
    if (temp >= 30) {
      return "../Asset/sunny.png"; // 30°+ clear
    }
    return "../Asset/partly-cloudy.png"; // mild clear
  }

  //  CLOUDS (temperature based)
  if (main === "clouds") {
    if (temp >= 26 && temp <= 30) {
      return "../Asset/partly-cloudy.png"; // warm clouds
    }
    return "../Asset/cloudy.png"; // cool / heavy clouds
  }

  //  RAIN / DRIZZLE
  if (main === "rain" || main === "drizzle") {
    return "../Asset/rain.png";
  }

  //  THUNDER
  if (main === "thunderstorm") {
    return "../Asset/thunder.png";
  }

  // ❄️ SNOW
  if (main === "snow") {
    return "../Asset/snow.png";
  }

  //  DEFAULT
  return "../Asset/cloudy.png";
}
async function fetchCurrentWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  return await res.json();
}

function groupByDay(list) {
  const days = {};

  list.forEach(item => {
    const day = item.dt_txt.split(" ")[0]; // yyyy-mm-dd

    if (!days[day]) {
      days[day] = [];
    }
    days[day].push(item);
  });

  return days;
}
async function loadWeather() {
  try {
    const [current, forecastRes] = await Promise.all([
      fetchCurrentWeather(),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`)
    ]);

    const forecast = await forecastRes.json();
    renderWeather(forecast.list, current);

  } catch (e) {
    console.error("Weather error", e);
  }
}

function renderWeather(list, current) {
  const wrapper = document.getElementById("weatherWrapper");
  wrapper.innerHTML = "";

  if (!Array.isArray(list) || !current) return;

  const days = groupByDay(list);
  const dayKeys = Object.keys(days).slice(0, 5);

  dayKeys.forEach((dayKey, index) => {
    let label, tempText, weatherObj;

    if (index === 0) {
      // ✅ TODAY → LIVE TEMP + LIVE ICON
      label = "Today";
      tempText = `${Math.round(current.main.temp)}°`;
      weatherObj = current.weather[0]; // ✅ FIX
    } else {
      const entries = days[dayKey];

      const minTemp = Math.round(
        Math.min(...entries.map(e => e.main.temp_min))
      );
      const maxTemp = Math.round(
        Math.max(...entries.map(e => e.main.temp_max))
      );

      const noonData =
        entries.find(e => e.dt_txt.includes("12:00:00")) || entries[0];

      label = new Date(dayKey).toLocaleDateString("en-US", {
        weekday: "long"
      });
      tempText = `${minTemp} / ${maxTemp}°`;
      weatherObj = noonData.weather[0]; // ✅ FIX
    }

    const imgSrc = getLocalWeatherIcon(weatherObj);

    wrapper.innerHTML += `
      <div class="weather-card">
        <p>${label}</p>
        <div class="temp">${tempText}</div>
        <div class="icon">
          <img src="${imgSrc}" />
        </div>
      </div>
    `;
  });
}

loadWeather();
// =============================================
// GENERATION TOGGLE

document.getElementById("genToggle").addEventListener("click", () => {
  generationVisible = !generationVisible;
  log("Generation toggle:", generationVisible ? "ON" : "OFF");

  document.getElementById("genToggle").classList.toggle("off", !generationVisible);
  loadGenIncomeGraph();
});

// TIME FILTER (DAY / MONTH / YEAR)
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {

    if (currentTab !== "genIncome") {
      log("Time filter ignored (not genIncome)");
      return;
    }

    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentMode = btn.dataset.mode;
    log("Time filter changed:", currentMode);

    reloadCurrentGraph();
  });
});

document.getElementById("chartDate").addEventListener("change", e => {
  selectedDate = e.target.value;
  log("Date changed:", selectedDate);
  reloadCurrentGraph();
});

// TAB SWITCHING
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    log("Tab clicked:", tab);

    if (tab === "power") loadPowerGraph();
    if (tab === "genIncome") loadGenIncomeGraph();
  });
});
function initInverterViews() {
  const settingsBtn = document.getElementById("invSettingsBtn");
  const invSwitch = document.querySelector(".inv-switch");

  const dataView = document.getElementById("dataView");
  const curveView = document.getElementById("curveView");
  const editView = document.getElementById("editView");

  const saveBtn = document.getElementById("editSave");
  const cancelBtn = document.getElementById("editCancel");

  const btnCurve = document.getElementById("btnCurve");
  const btnData = document.getElementById("btnData");

  showDataView();

  function showDataView() {
    dataView.classList.remove("hidden");
    curveView.classList.add("hidden");
    editView.classList.add("hidden");

    invSwitch.classList.remove("hidden");
    btnCurve.classList.remove("hidden");
    btnData.classList.add("hidden");
  }

  function showCurveView() {
    dataView.classList.add("hidden");
    curveView.classList.remove("hidden");
    editView.classList.add("hidden");

    btnCurve.classList.add("hidden");
    btnData.classList.remove("hidden");

    setTimeout(renderBottomCurve, 50);
  }

  function showEditView() {
    dataView.classList.add("hidden");
    curveView.classList.add("hidden");
    editView.classList.remove("hidden");
    invSwitch.classList.add("hidden");
  }

  btnCurve?.addEventListener("click", showCurveView);
  btnData?.addEventListener("click", showDataView);
  settingsBtn?.addEventListener("click", showEditView);
  saveBtn?.addEventListener("click", showDataView);
  cancelBtn?.addEventListener("click", showDataView);
}
// ===============================
// BOTTOM CURVE STATE (FINAL)
// ===============================
let bottomTab = "power";
let bottomMode = "day";
let bottomGenerationVisible = true;
let bottomCategory = "power";
let pvBottomChart = null;

function getBottomPowerData(category) {
  const baseLabels = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"];

  const map = {
    power: [0, 0, 180, 320, 410, 460, 450, 430, 400, 360, 330],
    v_mppt1: [0, 0, 120, 230, 240, 245, 242, 238, 232, 228, 220],
    i_mppt1: [0, 0, 1.2, 2.4, 3.1, 3.3, 3.2, 3.0, 2.8, 2.4, 2.1],
    ua: [0, 0, 210, 218, 223, 225, 224, 222, 220, 218, 216],
    iac1: [0, 0, 0.8, 1.4, 1.9, 2.1, 2.0, 1.9, 1.7, 1.5, 1.3]
  };

  return { labels: baseLabels, data: map[category] || [] };
}

function renderBottomPowerCurve() {
  const canvas = document.getElementById("pvChartBottom");
  if (!canvas) return;

  if (pvBottomChart) pvBottomChart.destroy();

  const { labels, data } = getBottomPowerData(bottomCategory);

  pvBottomChart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: "#00d5ff",
        tension: 0.35,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}

function renderBottomGenIncomeCurve() {
  const canvas = document.getElementById("pvChartBottom");
  if (!canvas) return;

  if (pvBottomChart) pvBottomChart.destroy();

  const { labels, gen, income } =
    getGenIncomeData(bottomMode, selectedDate);

  pvBottomChart = new Chart(canvas.getContext("2d"), {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Generation (kWh)",
          data: bottomGenerationVisible ? gen : [],
          backgroundColor: "#4CC7B3",
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.6
        },
        {
          type: "line",
          label: "Income (INR)",
          data: income,
          borderColor: "#0078A8",
          borderWidth: 2.5,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y2"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "kWh"
          },
          grid: {
            color: "rgba(255,255,255,0.12)"
          },
          ticks: {
            color: "#c7fff4"
          }
        },
        y2: {
          beginAtZero: true,
          position: "right",
          title: {
            display: true,
            text: "INR"
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: "#c7fff4"
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#c7fff4"
          }
        }
      }
    }
  });
}


function renderBottomCurve() {
  bottomTab === "power"
    ? renderBottomPowerCurve()
    : renderBottomGenIncomeCurve();
}

// ----------------------
// BOTTOM CURVE STATE
// let bottomTab = "power";      
// let bottomMode = "day";      
// let bottomGenerationVisible = true;
// let bottomCategory = "power";
// let pvBottomChart = null;


// function getBottomPowerData(category) {
//   const baseLabels = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"];

//   const map = {
//     power: [0, 0, 180, 320, 410, 460, 450, 430, 400, 360, 330],
//     v_mppt1: [0, 0, 120, 230, 240, 245, 242, 238, 232, 228, 220],
//     i_mppt1: [0, 0, 1.2, 2.4, 3.1, 3.3, 3.2, 3.0, 2.8, 2.4, 2.1],
//     ua: [0, 0, 210, 218, 223, 225, 224, 222, 220, 218, 216],
//     iac1: [0, 0, 0.8, 1.4, 1.9, 2.1, 2.0, 1.9, 1.7, 1.5, 1.3]
//   };


//   return {
//     labels: baseLabels,
//     data: map[category] || []
//   };
// }

// function renderBottomPowerCurve() {
//   const canvas = document.getElementById("pvChartBottom");
//   if (!canvas) return;

//   if (pvBottomChart) pvBottomChart.destroy();

//   const { labels, data } = getBottomPowerData(bottomCategory);

//   pvBottomChart = new Chart(canvas.getContext("2d"), {
//     type: "line",
//     data: {
//       labels,
//       datasets: [{
//         label: bottomCategory,
//         data,
//         borderColor: "#00d5ff",
//         tension: 0.35,
//         pointRadius: 0
//       }]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: { legend: { display: false } },
//       scales: {
//         x: { ticks: { color: "#c7fff4" }, grid: { display: false } },
//         y: {
//           ticks: { color: "#c7fff4" },
//           grid: { color: "rgba(255,255,255,0.15)" }
//         }
//       }
//     }
//   });
// }

// function renderBottomGenIncomeCurve() {
//   const canvas = document.getElementById("pvChartBottom");
//   if (!canvas) return;

//   if (pvBottomChart) pvBottomChart.destroy();

//   const { labels, gen, income } =
//     getGenIncomeData(bottomMode, selectedDate);

//   pvBottomChart = new Chart(canvas.getContext("2d"), {
//     data: {
//       labels,
//       datasets: [
//         {
//           type: "bar",
//           label: "Generation (kWh)",
//           data: bottomGenerationVisible ? gen : [],
//           backgroundColor: "#4CC7B3",
//           borderRadius: 6
//         },
//         {
//           type: "line",
//           label: "Income (INR)",
//           data: income,
//           borderColor: "#00d5ff",
//           yAxisID: "y2",
//           tension: 0.35,
//           pointRadius: 0
//         }
//       ]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: { legend: { display: false } },
//       scales: {
//         y: { ticks: { color: "#c7fff4" } },
//         y2: {
//           position: "right",
//           ticks: { color: "#c7fff4" },
//           grid: { drawOnChartArea: false }
//         }
//       }
//     }
//   });
// }

// function renderBottomCurve() {
//   console.log("Bottom curve render:", bottomTab, bottomCategory);

//   if (bottomTab === "power") {
//     renderBottomPowerCurve();
//   } else {
//     renderBottomGenIncomeCurve();
//   }
// }

// const categorySelect = document.getElementById("powerCategory");

// if (categorySelect) {
//   categorySelect.addEventListener("change", e => {
//     bottomCategory = e.target.value;
//     renderBottomCurve();
//   });
// }

// document.querySelectorAll(".bottom-tab").forEach(btn => {
//   btn.addEventListener("click", () => {
//     document.querySelectorAll(".bottom-tab")
//       .forEach(b => b.classList.remove("active"));

//     btn.classList.add("active");
//     bottomTab = btn.dataset.tab;

//     renderBottomCurve();
//   });
// });

// // ===============================
// // BOTTOM CONTROLS
// // ===============================

// const powerBtn = document.getElementById("powerBtn");
// const genIncomeBtn = document.getElementById("genIncomeBtn");
// const powerMenu = document.getElementById("powerMenu");
// const powerLabel = document.getElementById("powerLabel");

// const bottomTimeFilter = document.getElementById("bottomTimeFilter");
// const bottomGenToggle = document.getElementById("bottomGenToggle");

// renderBottomPowerCurve();

powerBtn.addEventListener("click", e => {
  e.stopPropagation();

  bottomTab = "power";

  powerBtn.classList.add("active");
  genIncomeBtn.classList.remove("active");

  bottomTimeFilter.classList.add("hidden");
  bottomGenToggle.classList.add("hidden");

  powerMenu.classList.toggle("hidden");
  renderBottomPowerCurve();
});

// ---------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------
document.addEventListener("click", () => {
  powerMenu.classList.add("hidden");
});

// ---------- POWER DROPDOWN ITEMS ----------
powerMenu.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", () => {
    bottomCategory = item.dataset.value;
    powerLabel.textContent = item.textContent;

    powerMenu.classList.add("hidden");
    renderBottomPowerCurve();
  });
});

// ---------- GEN & INCOME BUTTON ----------
genIncomeBtn.addEventListener("click", () => {
  bottomTab = "genIncome";

  genIncomeBtn.classList.add("active");
  powerBtn.classList.remove("active");

  bottomTimeFilter.classList.remove("hidden");
  bottomGenToggle.classList.remove("hidden");

  powerMenu.classList.add("hidden");
  renderBottomGenIncomeCurve();
});

// ---------- TIME FILTER (DAY / MONTH / YEAR) ----------
document.querySelectorAll("#bottomTimeFilter .filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (bottomTab !== "genIncome") return;

    document
      .querySelectorAll("#bottomTimeFilter .filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    bottomMode = btn.dataset.mode;

    renderBottomGenIncomeCurve();
  });
});

// ---------- GENERATION TOGGLE ----------
bottomGenToggle.addEventListener("click", () => {
  bottomGenerationVisible = !bottomGenerationVisible;
  bottomGenToggle.classList.toggle("off", !bottomGenerationVisible);
  renderBottomGenIncomeCurve();
});
document.addEventListener("DOMContentLoaded", () => {

  const settingsBtn = document.getElementById("invSettingsBtn");
  const invSwitch = document.querySelector(".inv-switch");

  const dataView = document.getElementById("dataView");
  const curveView = document.getElementById("curveView");
  const editView = document.getElementById("editView");

  const saveBtn = document.getElementById("editSave");
  const cancelBtn = document.getElementById("editCancel");

  const btnCurve = document.getElementById("btnCurve");
  const btnData = document.getElementById("btnData");

  // ---------- DEFAULT STATE ----------
  showDataView();

  function showDataView() {
    dataView.classList.remove("hidden");
    curveView.classList.add("hidden");
    editView.classList.add("hidden");

    invSwitch.classList.remove("hidden");
    btnCurve.classList.remove("hidden");
    btnData.classList.add("hidden");
  }

  function showCurveView() {
    dataView.classList.add("hidden");
    curveView.classList.remove("hidden");
    editView.classList.add("hidden");

    btnCurve.classList.add("hidden");
    btnData.classList.remove("hidden");

    setTimeout(renderBottomCurve, 50);
  }

  function showEditView() {
    dataView.classList.add("hidden");
    curveView.classList.add("hidden");
    editView.classList.remove("hidden");

    invSwitch.classList.add("hidden");
  }

  // ---------- EVENTS ----------
  btnCurve?.addEventListener("click", showCurveView);
  btnData?.addEventListener("click", showDataView);

  settingsBtn?.addEventListener("click", showEditView);

  saveBtn?.addEventListener("click", showDataView);
  cancelBtn?.addEventListener("click", showDataView);

});

// ===============================
// CHART FULLSCREEN TOGGLE
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const expandBtn = document.getElementById("expandChartBtn");
  const chartCard = document.getElementById("mainChartCard");

  if (expandBtn && chartCard) {
    expandBtn.addEventListener("click", () => {
      chartCard.classList.toggle("fullscreen");
      document.body.classList.toggle("chart-expanded");

      setTimeout(() => {
        pvChart?.resize();
      }, 50);
    });
  }

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && chartCard?.classList.contains("fullscreen")) {
    chartCard.classList.remove("fullscreen");
    document.body.classList.remove("chart-expanded");

    setTimeout(() => {
      pvChart?.resize();
      pvChart?.update("none"); // ✅ IMPORTANT
    }, 50);
  }
});

});

