/* =========================================================
   LOCATION MODAL (SELF-CONTAINED MODULE)
========================================================= */
function initLocationModal() {

    const locationData = {
        Global: {},
        India: {
            Kerala: {
                Kannur: {}, Kanhangad: {}, Kumaramputhur: {}, Malappuram: {},
                Ottappalam: {}, Palakkad: {}, Perumbavoor: {}, Shoranur: {},
                Taliparamba: {}, Thalassery: {}
            },
            "Tamil Nadu": { Chennai: {}, Coimbatore: {} }
        },
        Nigeria: {
            Lagos: { Ikeja: {}, Epe: {} },
            Kano: {}
        }
    };

    let currentPath = [];
    let selectedPaths = new Set();

    const modal = document.getElementById('location-modal-overlay');
    const sourceListEl = document.getElementById('ls-source-list');
    const selectedListEl = document.getElementById('ls-selected-list');
    const currentPathEl = document.getElementById('ls-current-path');
    const btnClear = document.getElementById('ls-btn-clear');

    // 🔒 SAFETY GUARD
    if (!modal || !sourceListEl || !selectedListEl || !currentPathEl) {
        console.warn('[LocationModal] DOM not ready');
        return null;
    }

    /* ===============================
       CLEAR SELECTED
    =============================== */
    btnClear?.addEventListener('click', () => {
        selectedPaths.clear();
        renderSelectedList();
    });

    /* ===============================
       RENDER TREE VIEW
    =============================== */
    function renderView() {
        sourceListEl.innerHTML = '';
        renderRow(locationData, 0, null);

        let pointer = locationData;
        for (let i = 0; i < currentPath.length; i++) {
            const key = currentPath[i];
            if (pointer[key] && Object.keys(pointer[key]).length) {
                pointer = pointer[key];
                renderRow(pointer, i + 1, key);
            }
        }
        updateBreadcrumb();
    }

    function renderRow(dataObj, levelIndex, parentLabel) {
        const row = document.createElement('div');
        row.className = 'ls-row';

        if (parentLabel) {
            const label = document.createElement('div');
            label.className = 'ls-parent-label';
            label.textContent = parentLabel;
            row.appendChild(label);
        }

        Object.keys(dataObj).forEach(key => {
            const wrap = document.createElement('div');
            wrap.className = 'ls-inline-item';

            const text = document.createElement('span');
            text.className = 'ls-text';
            text.textContent = key;

            if (currentPath[levelIndex] === key) {
                text.classList.add('active');
            }

            text.onclick = () => {
                currentPath = currentPath.slice(0, levelIndex);
                currentPath.push(key);
                renderView();
            };

            wrap.appendChild(text);

            if (currentPath[levelIndex] === key) {
                const icon = document.createElement('div');
                icon.className = 'ls-icon-btn';
                icon.innerHTML = `<i class="fa-solid fa-plus"></i>`;
                icon.onclick = (e) => {
                    e.stopPropagation();
                    selectedPaths.add(currentPath.join('/'));
                    renderSelectedList();
                };
                wrap.appendChild(icon);
            }

            row.appendChild(wrap);
        });

        sourceListEl.appendChild(row);
    }

    /* ===============================
       BREADCRUMB
    =============================== */
    function updateBreadcrumb() {
        currentPathEl.textContent = currentPath.length
            ? currentPath.join('/')
            : 'Global / India / Kerala...';
    }

    /* ===============================
       SELECTED LIST
    =============================== */
    function renderSelectedList() {
        selectedListEl.innerHTML = '';
        selectedPaths.forEach(path => {
            const div = document.createElement('div');
            div.className = 'selected-row';
            div.innerHTML = `
                <span>${path}</span>
                <i class="fa-regular fa-trash-can"></i>
            `;
            div.querySelector('i').onclick = () => {
                selectedPaths.delete(path);
                renderSelectedList();
            };
            selectedListEl.appendChild(div);
        });
    }
    return {
        open() {
            modal.classList.add('show');
            renderView();
            renderSelectedList();
        },
        close() {
            modal.classList.remove('show');
        },
        getSelected() {
            return Array.from(selectedPaths);
        }
    };
}
function initOrganizationModal() {

    /* ===============================
       DATA (HIERARCHY)
    =============================== */
    const organizationData = {
        Global: {
            India: {
                Kerala: {
                    Kannur: {
                        "Vertex 02": {}
                    },
                    Kochi: {}
                },
                "Tamil Nadu": {
                    Chennai: {}
                }
            }
        }
    };

    /* ===============================
       CONFIG
       UI starts directly at ORG level
    =============================== */
    const ORG_START_PATH = ['Global', 'India', 'Kerala', 'Kannur'];

    /* ===============================
       STATE
    =============================== */
    let currentPath = [];                 // relative path from ORG_START_PATH
    let selected = new Map();             // key = fullPath, value = label

    /* ===============================
       DOM
    =============================== */
    const modal = document.getElementById('org-modal-overlay');
    const sourceList = document.getElementById('org-source-list');
    const selectedList = document.getElementById('org-selected-list');

    if (!modal || !sourceList || !selectedList) {
        console.warn('[OrganizationModal] DOM not ready');
        return null;
    }

    /* ===============================
       RENDER TREE (LEFT PANEL)
    =============================== */
    function renderTree() {
        sourceList.innerHTML = '';

        let pointer = organizationData;

        // Move pointer to ORG_START_PATH
        ORG_START_PATH.forEach(p => {
            pointer = pointer[p];
        });

        // Move pointer further based on navigation
        currentPath.forEach(p => {
            pointer = pointer[p];
        });

        Object.keys(pointer).forEach(key => {
            const value = pointer[key];
            const isLeaf = Object.keys(value).length === 0;

            const row = document.createElement('div');
            row.className = 'org-item';

            const label = document.createElement('span');
            label.textContent = key;
            label.style.cursor = isLeaf ? 'default' : 'pointer';

            // Navigate deeper only if NOT leaf
            if (!isLeaf) {
                label.onclick = () => {
                    currentPath.push(key);
                    renderTree();
                };
            }

            row.appendChild(label);

            // Select only LEAF (organization)
            if (isLeaf) {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-file-circle-plus';
                icon.style.color = '#00bfa5';
                icon.style.cursor = 'pointer';

                icon.onclick = e => {
                    e.stopPropagation();

                    const fullPath =
                        [...ORG_START_PATH, ...currentPath, key].join('/');

                    selected.set(fullPath, key); // store label + full path
                    renderSelected();
                };

                row.appendChild(icon);
            }

            sourceList.appendChild(row);
        });
    }

    /* ===============================
       RENDER SELECTED LIST (RIGHT)
    =============================== */
    function renderSelected() {
        selectedList.innerHTML = '';

        selected.forEach((label, fullPath) => {
            const row = document.createElement('div');
            row.className = 'org-item';
            row.innerHTML = `
                <span>${label}</span>
                <i class="fa-regular fa-trash-can"></i>
            `;

            row.querySelector('i').onclick = () => {
                selected.delete(fullPath);
                renderSelected();
            };

            selectedList.appendChild(row);
        });
    }

    /* ===============================
       ACTIONS
    =============================== */
    document.getElementById('org-btn-clear')?.addEventListener('click', () => {
        selected.clear();
        renderSelected();
    });

    document.getElementById('org-btn-cancel')?.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    document.getElementById('org-btn-confirm')?.addEventListener('click', () => {
        // FULL PATHS FOR BACKEND
        const payload = Array.from(selected.keys());
        console.log('[Organization Selected]', payload);

        modal.classList.remove('show');
    });

    /* ===============================
       PUBLIC API
    =============================== */
    return {
        open() {
            modal.classList.add('show');
            currentPath = [];
            renderTree();
            renderSelected();
        },
        close() {
            modal.classList.remove('show');
        },
        getSelected() {
            return Array.from(selected.keys()); // backend-ready
        }
    };
}
/* =========================================================
   INVERTER MODAL (FULL MODULE)
========================================================= */

/* ===============================
   MOCK API DATA (REPLACE WITH REAL API LATER)
=============================== */
const inverterApiResponse = [
    {
        plant: "BINU",
        inverters: [
            { model: "GW3300-XS", sn: "53300SSX22BW1357" },
            { model: "GW3000", sn: "GW3000SN001" }
        ]
    },
    {
        plant: "CAPITAL ASSOCIATES",
        inverters: [
            { model: "GW5000", sn: "GW5000SN009" }
        ]
    }
];

/* ===============================
   FETCH INVERTER DATA
=============================== */

let selectedInverters = new Map();

/* ===============================
   FETCH (MOCK)
=============================== */
async function fetchInverterData() {
    await new Promise(res => setTimeout(res, 300));
    return inverterApiResponse;
}

/* ===============================
   RENDER SOURCE LIST
=============================== */
async function renderInverterSourceList() {
    const container = document.getElementById('inverter-source-list');
    if (!container) return;

    container.innerHTML = '<p style="padding:10px;color:#999">Loading...</p>';

    const data = await fetchInverterData();
    container.innerHTML = '';

    data.forEach(plantObj => {
        const plantItem = document.createElement('div');
        plantItem.className = 'plant-item';

        plantItem.innerHTML = `
            <div class="plant-header">
                <i class="fa-solid fa-chevron-right arrow-icon"></i>
                <span class="plant-name">${plantObj.plant}</span>
            </div>
            <div class="plant-details"></div>
        `;

        plantItem
            .querySelector('.plant-header')
            .addEventListener('click', () =>
                plantItem.classList.toggle('active')
            );

        const details = plantItem.querySelector('.plant-details');

        plantObj.inverters.forEach(inv => {
            const row = document.createElement('div');
            row.className = 'inverter-row';

            row.innerHTML = `
                <div class="inverter-info">
                    <div class="inverter-model">${inv.model}</div>
                    <input class="inverter-sn" value="${inv.sn}" readonly />
                </div>
                <i class="fa-solid fa-file-circle-plus add-icon"></i>
            `;

            row.querySelector('.add-icon').onclick = () =>
                addToSelectedInverters(
                    plantObj.plant,
                    inv.model,
                    inv.sn
                );

            details.appendChild(row);
        });

        container.appendChild(plantItem);
    });
}

/* ===============================
   SELECTED LIST
=============================== */
function addToSelectedInverters(plant, model, sn) {
    if (selectedInverters.has(sn)) return;
    selectedInverters.set(sn, { plant, model, sn });
    renderSelectedInverters();
}

function removeSelectedInverter(sn) {
    selectedInverters.delete(sn);
    renderSelectedInverters();
}

function renderSelectedInverters() {
    const list = document.getElementById('inverter-selected-list');
    if (!list) return;

    list.innerHTML = '';

    selectedInverters.forEach(({ model, sn }) => {
        const div = document.createElement('div');
        div.className = 'selected-item';

        div.innerHTML = `
            <div class="selected-info">
                <div class="selected-model">${model}</div>
                <input class="selected-sn" value="${sn}" readonly />
            </div>
            <i class="fa-regular fa-trash-can delete-icon"></i>
        `;

        div.querySelector('.delete-icon').onclick = () =>
            removeSelectedInverter(sn);

        list.appendChild(div);
    });
}

/* ===============================
   MODAL OPEN / CLOSE
=============================== */
function openInverterModal() {
    const modal = document.getElementById('inverter-modal-overlay');
    if (!modal) return;

    modal.classList.add('show');

    renderInverterSourceList();
    renderSelectedInverters();

    // ✅ ATTACH FOOTER EVENTS HERE
    const cancelBtn = modal.querySelector('#inverter-btn-cancel');
    const confirmBtn = modal.querySelector('#inverter-btn-confirm');
    const clearBtn = modal.querySelector('#inverter-btn-clear');

    cancelBtn.onclick = closeInverterModal;

    confirmBtn.onclick = () => {
        const payload = Array.from(selectedInverters.values());
        console.log('[Inverter Selected Payload]', payload);
        closeInverterModal();
    };

    clearBtn.onclick = () => {
        selectedInverters.clear();
        renderSelectedInverters();
    };
}


function closeInverterModal() {
    document
        .getElementById('inverter-modal-overlay')
        ?.classList.remove('show');
}

document
    .getElementById('inverter-btn-cancel')
    ?.addEventListener('click', closeInverterModal);

document.getElementById('inverter-btn-confirm')
    ?.addEventListener('click', () => {

        const map = new Map();
        selectedInverters.forEach(inv => {
            map.set(inv.sn, {
                id: inv.sn,
                label: `${inv.model} - ${inv.sn}`
            });
        });

        renderSearchTagsFromList(map);
        closeInverterModal();
    });

document
    .getElementById('inverter-btn-clear')
    ?.addEventListener('click', () => {
        selectedInverters.clear();
        renderSelectedInverters();
    });

const searchSelectionMap = new Map();

function initGenerationReports() {
    /* ===============================
       1. DOM ELEMENT REFERENCES
    =============================== */
    // --- Mode Switching ---
    const menuReports = document.getElementById('menu-reports');
    const menuStatistics = document.getElementById('menu-statistics');
    const searchReports = document.getElementById('search-group-reports');
    const searchStatistics = document.getElementById('search-group-statistics');
    const filterReportType = document.getElementById('filter-report-type');
    const dailyHelpText = document.getElementById('daily-help-text');

    // --- Date Inputs ---
    const singleDateInput = document.getElementById('single-date-input');
    const dateRangeInputs = document.getElementById('date-range-inputs');
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    const dateInput = document.getElementById('filter-date-input'); // Statistics date input

    // --- Views and Sections ---
    const noDataView = document.getElementById('no-data-view');
    const resultsView = document.getElementById('report-results-view');
    const tableBody = document.getElementById('report-table-body');
    const tableHead = document.getElementById('report-table-head');
    const resultsTableHeader = document.getElementById('results-table-header');

    // Results Step Logic
    const btnNextStep = document.getElementById('btn-next-step');
    const btnPrevStep = document.getElementById('btn-prev-step');
    const resultsStep2 = document.getElementById('results-step-2');
    const chartSection = resultsView?.querySelector('.chart-section');
    const tableSection = resultsView?.querySelector('.table-section');

    // --- Search & Main UI ---
    const searchInput = document.querySelector('.search-input-wrapper');
    const searchInputField = document.querySelector('.search-input-field');
    const searchTagsContainer = document.getElementById('search-tags-container');
    const btnGenerateReport = document.getElementById('btn-generate-report');
    const reportsDisplayArea = document.querySelector('.reports-display-area');

    // --- Tabs ---
    const genTabs = document.querySelectorAll('.gen-tab');
    const genTabLabel = document.querySelector('.gen-tab');
    const psTabs = document.querySelectorAll('.ps-tab');
    const viewPlant = document.getElementById('view-plant');

    const tabPlant = document.querySelector('.gen-tab[data-tab="plant"]') || genTabs[0];
    const tabLocation = document.querySelector('.gen-tab[data-tab="location"]');
    const tabOrganization = document.querySelector('.gen-tab[data-tab="organization"]');

    // --- Lists & Selection UI ---
    const sourceListContainer = document.getElementById('ps-source-list');
    const selectedListContainer = document.getElementById('ps-selected-list');
    const btnClearSelection = document.getElementById('btn-clear-selection');

    // --- Modals ---
    const modalOverlay = document.getElementById('plant-modal-overlay');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const btnConfirm = document.getElementById('btn-confirm-modal');

    // Location Modal
    const locationCancel = document.getElementById('ls-btn-cancel');
    const locationConfirm = document.getElementById('ls-btn-confirm');
    const locationModalCtrl = initLocationModal(); // Initialize here

    // Organization Modal
    const orgConfirm = document.getElementById('org-btn-confirm');
    const orgModal = initOrganizationModal(); // Initialize here

    // Inverter Modal
    const inverterConfirmBtn = document.getElementById('inverter-btn-confirm');

    // --- Features ---
    const btnExport = document.getElementById('btn-export');
    const exportPopup = document.getElementById('export-popup');
    const helpIcon = document.querySelector('.ps-help-icon');
    const helpNote = document.querySelector('.ps-note');
    const dynamicSelect = document.getElementById('dynamic-location-select');

    /* ===============================
       2. STATE VARIABLES
    =============================== */
    let currentMode = 'reports';
    let currentTab = 'Plant';
    let currentData = [];
    let selectedIds = new Set();
    let activeGenTab = 'plant'; // default tab
    let locationSelection = { region: '', state: '', district: '' };
    let currentSelectionLevel = 'region'; // region, state, district
    let reportChartInstance = null;

    // --- Initialize Data ---
    const locationData = {
        india: {
            states: {
                "Kerala": ["Ernakulam", "Trivandrum", "Kozhikode"],
                "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
                "Karnataka": ["Bangalore", "Mysore", "Hubli"]
            }
        },
        nigeria: {
            states: {
                "Lagos": ["Ikeja", "Badagry", "Ikorodu"],
                "Kano": ["Kano Municipal", "Fagge", "Gwale"],
                "Oyo": ["Ibadan", "Ogbomosho", "Iseyin"]
            }
        },
        global: {
            states: {
                "USA": ["New York", "California", "Texas"],
                "UK": ["London", "Manchester", "Birmingham"],
                "Germany": ["Berlin", "Munich", "Hamburg"]
            }
        }
    };

    const plantData = [
        {
            id: 1,
            name: "BINU",
            status: "green",
            reports: {
                daily: [
                    { date: "2025-01-08", generation: 12.3, income: 104.55 },
                    { date: "2025-01-09", generation: 14.1, income: 118.20 }
                ],
                monthly: [
                    { month: "2025-01", generation: 320, income: 2450 }
                ],
                annual: [
                    { year: "2025", generation: 3800, income: 29000 }
                ],
                simulation: [
                    { year: "2026", generation: 4100, income: 32000 }
                ],
                userDefined: [
                    { from: "2025-01-01", to: "2025-01-10", generation: 110, income: 900 }
                ]
            }
        },
        {
            id: 2,
            name: "Biju Ramachandran",
            status: "green",
            reports: {
                daily: [],
                monthly: [],
                annual: [],
                simulation: [],
                userDefined: []
            }
        },
        {
            id: 3,
            name: "CAPITAL ASSOCIATES",
            status: "green",
            reports: {
                daily: [
                    { date: "2025-01-08", generation: 22.1, income: 180 }
                ],
                monthly: [],
                annual: [],
                simulation: [],
                userDefined: []
            }
        }
    ];

    // Set initial data
    currentData = plantData;

    function updateDailyHelpVisibility() {
        if (!filterReportType || !dailyHelpText) return;

        if (filterReportType.value === 'Daily Report') {
            dailyHelpText.style.display = 'block';
        } else {
            dailyHelpText.style.display = 'none';
        }
    }

    // run once on load
    updateDailyHelpVisibility();

    // update on change
filterReportType?.addEventListener('change', updateDailyHelpVisibility);

    function forcePlantTab() {
        activeGenTab = 'plant';

        // UI active state
        genTabs.forEach(t => t.classList.remove('active'));
        tabPlant?.classList.add('active');

        // Reset modal data to Plant
        currentTab = 'Plant';
        currentData = plantData;
        selectedIds.clear();
        renderLists();
    }

    function switchMode(mode) {
        currentMode = mode;
        if (mode === 'reports') {
            menuReports.classList.add('active');
            menuStatistics.classList.remove('active');
            searchReports.style.display = 'flex';
            searchStatistics.style.display = 'none';
            filterReportType.style.display = 'block';

            dateInput.placeholder = "Please Select Date";
            dateInput.type = 'text';
            dateInput.onfocus = function () { this.type = 'date'; };
            dateInput.onblur = function () { this.type = 'text'; };
            genTabLabel.textContent = 'Plant';
        } else {
            menuStatistics.classList.add('active');
            menuReports.classList.remove('active');
            searchReports.style.display = 'none';
            searchStatistics.style.display = 'flex';
            filterReportType.style.display = 'none';

            dateInput.placeholder = "Please Select Month";
            dateInput.type = 'month';
            genTabLabel.textContent = 'Location Statistics';
            locationSelection = { region: '', state: '', district: '' };
            currentSelectionLevel = 'region';
            updateDynamicOptions();
        }
        // Reset views
        if (noDataView) noDataView.style.display = 'flex';
        if (resultsView) resultsView.style.display = 'none';
    }

    // --- Dynamic Location Options ---
    function updateDynamicOptions() {
        if (!dynamicSelect) return;
        dynamicSelect.innerHTML = '';

        if (currentSelectionLevel === 'region') {
            dynamicSelect.innerHTML = `
                <option value="">Select Region</option>
                <option value="india">India</option>
                <option value="nigeria">Nigeria</option>
                <option value="global">Global</option>
            `;
        } else if (currentSelectionLevel === 'state') {
            const country = locationSelection.region;
            dynamicSelect.innerHTML = `<option value="BACK_TO_REGION">← Back to Regions</option>`;
            dynamicSelect.innerHTML += `<option value="" disabled selected>Select State (${country.charAt(0).toUpperCase() + country.slice(1)})</option>`;
            if (locationData[country] && locationData[country].states) {
                Object.keys(locationData[country].states).forEach(state => {
                    const opt = document.createElement('option');
                    opt.value = state;
                    opt.textContent = state;
                    dynamicSelect.appendChild(opt);
                });
            }
        } else if (currentSelectionLevel === 'district') {
            const country = locationSelection.region;
            const state = locationSelection.state;
            dynamicSelect.innerHTML = `<option value="BACK_TO_STATE">← Back to States</option>`;
            dynamicSelect.innerHTML += `<option value="" disabled selected>Select District (${state})</option>`;
            if (locationData[country] && locationData[country].states[state]) {
                locationData[country].states[state].forEach(dist => {
                    const opt = document.createElement('option');
                    opt.value = dist;
                    opt.textContent = dist;
                    dynamicSelect.appendChild(opt);
                });
            }
        }
    }

    // --- Data Fetching Helpers ---
    function getSelectedPlantName() {
        const plant = plantData.find(p => selectedIds.has(p.id));
        return plant ? plant.name : '-';
    }

    function getSelectedPlantReports(reportType) {
        const selectedPlants = plantData.filter(p => selectedIds.has(p.id));
        if (!selectedPlants.length) return [];

        // Single-plant reporting for now
        const plant = selectedPlants[0];
        if (!plant.reports) return [];

        switch (reportType) {
            case 'Daily Report': return plant.reports.daily || [];
            case 'Monthly Report': return plant.reports.monthly || [];
            case 'Annual Report': return plant.reports.annual || [];
            case 'Simulation Report': return plant.reports.simulation || [];
            case 'User-defined Report': return plant.reports.userDefined || [];
            default: return [];
        }
    }
    if (dailyHelpText && exportPopup) {
        dailyHelpText.addEventListener('click', (e) => {
            e.stopPropagation();
            exportPopup.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (
                !exportPopup.contains(e.target) &&
                !dailyHelpText.contains(e.target)
            ) {
                exportPopup.classList.remove('show');
            }
        });
    }

    // --- Validation Helpers (Hoisted) ---
    function hasValidSelection() {
        // PLANT (uses selectedIds)
        if (activeGenTab === 'plant') {
            return selectedIds.size > 0;
        }
        // ORGANIZATION (check tags rendered from org modal)
        if (activeGenTab === 'organization') {
            return searchTagsContainer && searchTagsContainer.children.length > 0;
        }
        // LOCATION (use cascading locationSelection object)
        if (activeGenTab === 'location') {
            return (
                locationSelection.region ||
                locationSelection.state ||
                locationSelection.district
            );
        }
        // INVERTER (uses selectedInverters from inverter modal)
        if (activeGenTab === 'inverter') {
            return typeof selectedInverters !== 'undefined' && selectedInverters.size > 0;
        }
        return false;
    }

    function selectionErrorMessage() {
        switch (activeGenTab) {
            case 'plant':
                return 'Please select at least one plant to generate a report.';
            case 'organization':
                return 'Please select at least one organization to generate a report.';
            case 'location':
                return 'Please select a complete location (region, state, district).';
            case 'inverter':
                return 'Please select at least one inverter to generate a report.';
            default:
                return 'Please make a selection.';
        }
    }


    // --- UI Update Functions ---
    function showNoDataUI() {
        if (reportsDisplayArea) {
            reportsDisplayArea.style.display = 'flex';
        }
    }

    function hideNoDataUI() {
        if (reportsDisplayArea) {
            reportsDisplayArea.style.display = 'none';
        }
    }
    function showNoDataOnly() {
        // Hide results completely
        if (resultsView) resultsView.style.display = 'none';

        // Show no-data view
        if (noDataView) {
            noDataView.style.display = 'flex';
            noDataView.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 300px;
            color: #999;
            text-align: center;
        ">
            <img 
                src="../Asset/document.png"
                alt="No Data"
                style="
                    width: 190px;
                    height: auto;
                    margin-bottom: 16px;
                    opacity: 0.8;
                "
            />

            <h3 style="margin: 0; font-weight: 500;">
                No Data Found
            </h3>

         
        </div>
    `;
        }
    }


    function updateTabsByReportType(reportType) {
        if (currentMode !== 'reports') return;

        const tabInverter = document.querySelector('.gen-tab[data-tab="inverter"]');

        if (searchReports) searchReports.style.display = 'flex';
        if (searchStatistics) searchStatistics.style.display = 'none';

        if (tabPlant) tabPlant.style.display = 'none';
        if (tabLocation) tabLocation.style.display = 'none';
        if (tabOrganization) tabOrganization.style.display = 'none';
        if (tabInverter) tabInverter.style.display = 'none';

        /* DAILY */
        if (reportType === 'Daily Report') {
            if (tabPlant) tabPlant.style.display = 'block';
        }
        /* MONTHLY / ANNUAL */
        else if (reportType === 'Monthly Report' || reportType === 'Annual Report') {
            if (tabPlant) tabPlant.style.display = 'block';
            if (tabLocation) tabLocation.style.display = 'block';
            if (tabOrganization) tabOrganization.style.display = 'block';
            if (searchStatistics) searchStatistics.style.display = 'flex';
        }
        /* USER-DEFINED */
        else if (reportType === 'User-defined Report') {
            if (tabPlant) tabPlant.style.display = 'block';
            if (tabOrganization) tabOrganization.style.display = 'block';
            if (tabInverter) tabInverter.style.display = 'block';
            if (searchStatistics) searchStatistics.style.display = 'flex';
        }

        // Reset active tab logic
        genTabs.forEach(t => t.classList.remove('active'));
        const firstVisibleTab = [...genTabs].find(t => t.style.display !== 'none');
        if (firstVisibleTab) {
            firstVisibleTab.classList.add('active');
            // Update activeGenTab state
            const tabType = firstVisibleTab.getAttribute('data-tab');
            if (tabType) activeGenTab = tabType;
        }
    }

    function updateModalTabsByReportType(reportType) {
        if (!psTabs.length) return;

        const onlyPlant =
            reportType === 'Daily Report' ||
            reportType === 'Simulation Report';

        psTabs.forEach(tab => {
            const name = tab.textContent.trim();
            tab.style.display = onlyPlant && name !== 'Plant' ? 'none' : 'block';
            tab.classList.toggle('active', name === 'Plant');
        });

        if (onlyPlant) {
            currentTab = 'Plant';
            currentData = plantData;
            selectedIds.clear();
            renderLists();
        }
    }

    function renderLists() {
        if (!sourceListContainer || !selectedListContainer) return;

        sourceListContainer.innerHTML = '';
        selectedListContainer.innerHTML = '';

        currentData.forEach(plant => {
            const item = document.createElement('div');
            item.className = 'ps-list-item';

            const left = document.createElement('div');
            left.className = 'ps-item-left';

            const dot = document.createElement('span');
            dot.className = `ps-status-dot ${plant.status}`;

            const name = document.createElement('span');
            name.className = 'ps-item-name';
            name.textContent = plant.name;

            left.append(dot, name);
            item.appendChild(left);

            if (selectedIds.has(plant.id)) {
                const del = document.createElement('i');
                del.className = 'fa-solid fa-trash-can ps-remove-icon';
                del.onclick = (e) => {
                    e.stopPropagation();
                    selectedIds.delete(plant.id);
                    renderLists();
                };
                item.appendChild(del);
                selectedListContainer.appendChild(item);
            } else {
                const add = document.createElement('i');
                add.className = 'fa-solid fa-file-circle-plus ps-add-icon';
                add.onclick = () => {
                    selectedIds.add(plant.id);
                    renderLists();
                };
                item.appendChild(add);
                sourceListContainer.appendChild(item);
            }
        });
    }

    function updateSearchPlaceholder() {
        if (!searchInputField || !searchTagsContainer) return;

        if (!searchInputField.dataset.placeholder) {
            searchInputField.dataset.placeholder = searchInputField.placeholder;
        }

        const hasTags = searchTagsContainer.children.length > 0;
        searchInputField.placeholder = hasTags ? '' : searchInputField.dataset.placeholder;
    }

    function renderSearchTags() {
        if (!searchTagsContainer) return;

        searchTagsContainer.innerHTML = '';
        const plantMap = new Map();
        plantData.forEach(p => plantMap.set(p.id, p.name));

        selectedIds.forEach(id => {
            const name = plantMap.get(id);
            if (name) {
                const tag = document.createElement('div');
                tag.className = 'ps-search-tag';
                tag.innerHTML = `
                <span>${name}</span>
                <i class="fa-solid fa-xmark ps-search-tag-remove" data-id="${id}"></i>
            `;
                tag.querySelector('.ps-search-tag-remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idToRemove = parseInt(e.target.dataset.id);
                    selectedIds.delete(idToRemove);
                    renderSearchTags();
                    updateSearchPlaceholder();
                });
                searchTagsContainer.appendChild(tag);
            }
        });
        updateSearchPlaceholder();
    }

    function renderSearchTagsFromList(list) {
        if (!searchTagsContainer) return;
        searchTagsContainer.innerHTML = '';

        list.forEach(item => {
            const tag = document.createElement('div');
            tag.className = 'ps-search-tag';
            tag.innerHTML = `
            <span>${item.label}</span>
            <i class="fa-solid fa-xmark ps-search-tag-remove"></i>
        `;
            tag.querySelector('.ps-search-tag-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                list.delete(item.id);
                renderSearchTagsFromList(list);   // re-render
            });
            searchTagsContainer.appendChild(tag);
        });
        updateSearchPlaceholder();
    }

    // --- Table & Chart Renderers ---
    function updateTableHeader(mode) {
        if (!tableHead) return;
        tableHead.innerHTML = '';

        if (mode === 'reports') {
            const tr = document.createElement('tr');
            const headers = ['Date', 'Plant', 'Classification', 'Capacity(kWp)', 'Generation(kWh)', 'Income($)'];
            resultsTableHeader.textContent = 'Statistics';
            headers.forEach(text => {
                const th = document.createElement('th');
                th.style.padding = '12px';
                th.style.textAlign = 'left';
                th.style.border = '1px solid rgba(255,255,255,0.1)';
                th.textContent = text;
                tr.appendChild(th);
            });
            tableHead.appendChild(tr);
        } else {
            const monthVal = dateInput.value || '11.2025';
            resultsTableHeader.textContent = `${monthVal} Generation Statistics`;

            // Row 1
            const tr1 = document.createElement('tr');
            const thOwner = document.createElement('th');
            thOwner.textContent = 'Owner Info';
            thOwner.colSpan = 1; thOwner.style.textAlign = 'center'; thOwner.style.padding = '8px'; thOwner.style.border = '1px solid rgba(255,255,255,0.2)';

            const thPlant = document.createElement('th');
            thPlant.textContent = 'Plant Info';
            thPlant.colSpan = 3; thPlant.style.textAlign = 'center'; thPlant.style.padding = '8px'; thPlant.style.border = '1px solid rgba(255,255,255,0.2)';

            const thGen = document.createElement('th');
            thGen.textContent = 'Generation(kWh)';
            thGen.colSpan = 3; thGen.style.textAlign = 'center'; thGen.style.padding = '8px'; thGen.style.border = '1px solid rgba(255,255,255,0.2)';

            tr1.appendChild(thOwner); tr1.appendChild(thPlant); tr1.appendChild(thGen);
            tableHead.appendChild(tr1);

            // Row 2
            const tr2 = document.createElement('tr');
            const subHeaders = ['Email', 'Name', 'Capacity (KW)', 'Location', 'Monthly Total', 'Daily Average', 'Total'];
            subHeaders.forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.padding = '10px'; th.style.textAlign = 'center'; th.style.fontSize = '12px'; th.style.fontWeight = '500'; th.style.border = '1px solid rgba(255,255,255,0.1)';
                tr2.appendChild(th);
            });
            tableHead.appendChild(tr2);
        }
    }

    function updateTable(mode) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const rowCount = 10;
        for (let i = 0; i < rowCount; i++) {
            const tr = document.createElement('tr');
            tr.style.backgroundColor = i % 2 === 0 ? '#fff' : '#fafafa';
            if (mode === 'reports') {
                tr.innerHTML = `
                    <td style="padding: 12px; border: 1px solid #eee;">08.01.2025</td>
                    <td style="padding: 12px; border: 1px solid #eee;">Binu</td>
                    <td style="padding: 12px; border: 1px solid #eee;">Residential</td>
                    <td style="padding: 12px; border: 1px solid #eee;">5</td>
                    <td style="padding: 12px; border: 1px solid #eee;">12.3</td>
                    <td style="padding: 12px; border: 1px solid #eee;">104.55</td>
                `;
            } else {
                tr.innerHTML = `
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">binu.alavathil@gmail.com</td>
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">Binu</td>
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">5</td>
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">India_kerala</td>
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">31.0</td>
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">10.4</td>
                    <td style="padding: 12px; border: 1px solid #eee; color: #666; font-size: 13px;">2199</td>
                `;
            }
            tableBody.appendChild(tr);
        }
    }

    function updateTableFromPlantData(rows) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.date || r.month || r.year || `${r.from} → ${r.to}`}</td>
                <td>${getSelectedPlantName()}</td>
                <td>Residential</td>
                <td>5</td>
                <td>${r.generation}</td>
                <td>${r.income}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function renderChartFromPlantData(rows) {
        renderChart();
    }

    function renderChart() {
        const ctx = document.getElementById('reportChart').getContext('2d');
        if (reportChartInstance) {
            reportChartInstance.destroy();
        }
        const labels = ['15.06.2025', '16.06.2025', '17.06.2025', '18.06.2025', '19.06.2025', '20.06.2025', '21.06.2025', '22.06.2025', '23.06.2025', '24.06.2025', '25.06.2025', '26.06.2025'];
        const barData = [380, 460, 360, 400, 430, 480, 440, 360, 410, 360, 150, 410];
        const lineData = [3900, 4700, 3700, 4100, 4400, 4900, 4500, 3700, 4200, 3700, 1600, 4200];

        reportChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line', label: 'Income ($)', data: lineData, borderColor: '#4db6ac',
                        backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 0, pointHoverRadius: 4, yAxisID: 'y1', order: 1
                    },
                    {
                        type: 'bar', label: 'Generation (kWh)', data: barData, backgroundColor: '#4db6ac',
                        hoverBackgroundColor: '#26a69a', borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.8, yAxisID: 'y', order: 2
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: true, position: 'top', labels: { usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 20, padding: 20, font: { size: 12 } } }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#888' } },
                    y: { beginAtZero: true, position: 'left', max: 600, title: { display: true, text: 'Generation (kWh)', color: '#888', font: { size: 11 } }, ticks: { stepSize: 100, color: '#888' }, grid: { color: '#f0f0f0' } },
                    y1: { type: 'linear', display: true, position: 'right', max: 6000, beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: 'Income ($)', color: '#888', font: { size: 11 } }, ticks: { stepSize: 1000, color: '#888' } }
                }
            }
        });
    }


    /* ===============================
       4. EVENT LISTENERS
    =============================== */

    // --- Mode Switching ---
    menuReports?.addEventListener('click', () => switchMode('reports'));
    menuStatistics?.addEventListener('click', () => switchMode('statistics'));

    // --- Report Type Change (Consolidated) ---
    if (filterReportType) {
        filterReportType.addEventListener('change', () => {
            const value = filterReportType.value;

            // RESET
            singleDateInput.style.display = 'block';
            dateRangeInputs.style.display = 'none';
            singleDateInput.value = '';
            singleDateInput.removeAttribute('min');
            singleDateInput.removeAttribute('max');

            // REPORT TYPE → DATE UI SWITCH
            if (value === 'User-defined Report') {
                singleDateInput.style.display = 'none';
                dateRangeInputs.style.display = 'flex';
            } else if (value === 'Annual Report' || value === 'Simulation Report') {
                singleDateInput.type = 'number';
                singleDateInput.placeholder = 'Select Year';
                singleDateInput.min = '2000';
                singleDateInput.max = new Date().getFullYear();
            } else if (value === 'Monthly Report') {
                singleDateInput.type = 'month';
                singleDateInput.placeholder = 'Select Month';
            } else {
                singleDateInput.type = 'date';
                singleDateInput.placeholder = 'Select Date';
            }

            // Updates for Report Mode
            if (currentMode === 'reports') {
                const isReportType = [
                    'Daily Report', 'Monthly Report', 'Annual Report',
                    'User-defined Report', 'Simulation Report'
                ].includes(value);

                if (isReportType) {
                    showNoDataUI();
                } else {
                    hideNoDataUI();
                }

                updateTabsByReportType(value);
                updateModalTabsByReportType(value);
                if (value === 'Simulation Report') {
                    forcePlantTab();
                }
            }
        });

        // Initialize on load
        updateTabsByReportType(filterReportType.value);
        updateModalTabsByReportType(filterReportType.value);
    }

    // --- Search & Tabs ---
    genTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Removing 'active' from all first
            genTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.getAttribute('data-tab');
            if (tabType) {
                activeGenTab = tabType;
                if (searchInputField) {
                    const placeholders = {
                        'plant': 'Please enter plant / SN / email',
                        'location': 'Please select a location',
                        'organization': 'Please select an organization',
                        'inverter': 'Please select an inverter'
                    };
                    searchInputField.placeholder = placeholders[tabType] || 'Please enter plant / SN / email';
                }
            }
        });
    });

    if (dynamicSelect) {
        dynamicSelect.addEventListener('change', () => {
            const val = dynamicSelect.value;
            if (val === 'BACK_TO_REGION') {
                currentSelectionLevel = 'region';
                locationSelection = { region: '', state: '', district: '' };
                updateDynamicOptions();
                return;
            }
            if (val === 'BACK_TO_STATE') {
                currentSelectionLevel = 'state';
                locationSelection.state = '';
                locationSelection.district = '';
                updateDynamicOptions();
                return;
            }
            if (currentSelectionLevel === 'region' && val) {
                locationSelection.region = val;
                currentSelectionLevel = 'state';
                updateDynamicOptions();
            } else if (currentSelectionLevel === 'state' && val) {
                locationSelection.state = val;
                currentSelectionLevel = 'district';
                updateDynamicOptions();
            } else if (currentSelectionLevel === 'district' && val) {
                locationSelection.district = val;
            }
        });
    }

    // --- Modal Interactions ---
    if (searchInput && modalOverlay) {
        searchInput.addEventListener('click', () => {
            if (currentMode !== 'reports') return;

            // Close all modals first
            modalOverlay?.classList.remove('show');
            locationModalCtrl?.close?.();
            orgModal?.close?.();
            closeInverterModal();
            const reportType = filterReportType?.value;

            if (reportType === 'Simulation Report') {
                forcePlantTab();
                modalOverlay.classList.add('show');
                return;
            }

            if (activeGenTab === 'plant') {
                modalOverlay.classList.add('show');
            } else if (activeGenTab === 'location') {
                locationModalCtrl?.open();
            } else if (activeGenTab === 'organization') {
                orgModal?.open();
            } else if (activeGenTab === 'inverter') {
                openInverterModal();
            }
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modalOverlay.classList.remove('show');
        });
    }

    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            modalOverlay.classList.remove('show');
            renderSearchTags();
            updateSearchPlaceholder();
        });
    }

    // Modal Tabs interaction
    psTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            psTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.textContent.trim();
            currentTab = tabName;

            if (viewPlant) {
                viewPlant.style.display = 'flex';
                const panelHeader = viewPlant.querySelector('.ps-panel-header span');
                if (panelHeader) {
                    panelHeader.textContent = `Select ${tabName}`;
                }
            }

            selectedIds.clear();
            if (tabName === 'SN') {
                currentData = [];
            } else if (tabName === 'Plant') {
                currentData = plantData;
            } else {
                currentData = [];
            }
            renderLists();
        });
    });

    // --- Location Modal Confirm ---
    locationConfirm?.addEventListener('click', () => {
        locationModalCtrl.close();
        const selected = locationModalCtrl.getSelected();
        locationSelection = { region: '', state: '', district: '' };

        if (selected.length > 0) {
            const parts = selected[0].split('/');
            locationSelection.region = parts[0] || '';
            locationSelection.state = parts[1] || '';
            locationSelection.district = parts[2] || '';
        }
        const locationMap = new Map(selected.map(path => [path, { id: path, label: path }]));
        renderSearchTagsFromList(locationMap);
    });

    // --- Org Modal Confirm ---
    orgConfirm?.addEventListener('click', () => {
        orgModal.close();
        const selected = orgModal.getSelected();
        const orgMap = new Map(selected.map(path => {
            const label = path.split('/').pop();
            return [path, { id: path, label }];
        }));
        renderSearchTagsFromList(orgMap);
    });

    // --- Inverter Modal Confirm ---
    inverterConfirmBtn?.addEventListener('click', () => {
        closeInverterModal();
        selectedInverters.forEach(inv => {
            const label = inv.model;
            const id = `inverter-${inv.sn}`;
            searchSelectionMap.set(id, { id, label });
        });
        renderSearchTagsFromList(searchSelectionMap);
    });


    // --- Generation & Results Navigation ---
    if (btnGenerateReport) {
        btnGenerateReport.addEventListener('click', () => {
            const reportType = filterReportType.value;
            let datePayload = {};

            if (reportType === 'User-defined Report') {
                const from = dateFromInput.value;
                const to = dateToInput.value;
                if (!from || !to) { alert('Please select From and To dates'); return; }
                if (from > to) { alert('From date cannot be greater than To date'); return; }
                datePayload = { from, to };
            } else {
                const date = singleDateInput.value;
                if (!date) { alert('Please select a valid date'); return; }
                if ((reportType === 'Annual Report' || reportType === 'Simulation Report') && date.length !== 4) {
                    alert('Please select a valid year'); return;
                }
                datePayload = { date };
            }

            console.log('Date Payload:', datePayload);
            const isReportType = ['Daily Report', 'Monthly Report', 'Annual Report', 'User-defined Report', 'Simulation Report'].includes(reportType);

            // Reset Result Steps
            if (resultsStep2) resultsStep2.style.display = 'none';
            if (btnPrevStep) btnPrevStep.style.display = 'none';
            if (btnNextStep) btnNextStep.textContent = 'Next';

            // MAIN GENERATION LOGIC
            if (currentMode === 'reports' && isReportType) {
                // NOW SAFE TO CALL because it's defined in scope
                if (!hasValidSelection()) {
                    alert(selectionErrorMessage());
                    return;
                }

                // Fetch Data
                const rows = getSelectedPlantReports(reportType);

                if (!rows.length) {
                    showNoDataOnly('No data found for the selected criteria.');
                    return;
                }


                // Show Results
                noDataView.style.display = 'none';
                resultsView.style.display = 'flex';
                chartSection.style.display = 'block';
                tableSection.style.display = 'block';

                updateTableHeader('reports');
                updateTableFromPlantData(rows);
                setTimeout(() => renderChartFromPlantData(rows), 100);
            }

            // Statistics Fallback
            if (currentMode === 'statistics') { // simpler check for now
                const locationSelected = locationSelection.region && locationSelection.state && locationSelection.district;
                const monthSelected = dateInput?.value;

                if (locationSelected && monthSelected) {
                    noDataView && (noDataView.style.display = 'none');
                    resultsView && (resultsView.style.display = 'flex');
                    if (chartSection) chartSection.style.display = 'none';
                    if (tableSection) tableSection.style.display = 'block';
                    updateTableHeader('statistics');
                    updateTable('statistics');
                } else {
                    // Empty state for stats
                    resultsView && (resultsView.style.display = 'flex');
                    chartSection && (chartSection.style.display = 'none');
                    tableSection && (tableSection.style.display = 'block');
                    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:60px; color:#bbb;">No Data</td></tr>`;
                }
            }
        });
    }

    if (btnNextStep && btnPrevStep) {
        btnNextStep.addEventListener('click', () => {
            if (resultsStep2.style.display === 'none') {
                if (chartSection) chartSection.style.display = 'none';
                if (tableSection) tableSection.style.display = 'none';
                resultsStep2.style.display = 'block';
                btnPrevStep.style.display = 'block';
                btnNextStep.textContent = 'Finish';
            } else {
                alert("Reporting process completed.");
            }
        });

        btnPrevStep.addEventListener('click', () => {
            resultsStep2.style.display = 'none';
            if (currentMode === 'reports') {
                if (chartSection) chartSection.style.display = 'block';
            }
            if (tableSection) tableSection.style.display = 'block';
            btnPrevStep.style.display = 'none';
            btnNextStep.textContent = 'Next';
        });
    }

    // Export Popup
    if (btnExport && exportPopup) {
        btnExport.addEventListener('click', (e) => {
            e.stopPropagation();
            exportPopup.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!exportPopup.contains(e.target) && e.target !== btnExport) {
                exportPopup.classList.remove('show');
            }
        });
    }
    if (btnExport) {
        btnExport.addEventListener('click', exportToExcel);
    }

    function exportToExcel() {
        const table = document.querySelector('.custom-table');

        if (!table) {
            alert('No data available to export');
            return;
        }

        // Create worksheet from table
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.table_to_sheet(table);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        // Download file
        XLSX.writeFile(workbook, 'Generation_Report.xlsx');
    }
    // Help Popup
    if (helpIcon && helpNote) {
        helpIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            helpNote.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!helpIcon.contains(e.target) && !helpNote.contains(e.target)) {
                helpNote.classList.remove('show');
            }
        });
    }

    // Initial Render
    renderLists();
    updateTableHeader('reports');
}
initGenerationReports();
