function initDataSelection() {
    let activeDataType = 'plant'; // plant | location | organization

    // 1. Data Definitions
    const indicatorSchema = [
        "V MPPT 1 (A)", "I MPPT 1 (A)", "Ua (V)", "I AC 1 (A)",
        "F AC 1 (Hz)", "Power (W)", "Working Mode", "Temperature (*C)",
        "Total Generation (kWh)", "H Total (h)", "RSSI", "PF"
    ];

    // Dummy Data for Inverter Tree (API READY: online / offline)
    const inverterData = [
        {
            name: "BINU",
            status: "online",
            children: [
                {
                    name: "GW3300-XS",
                    status: "online",
                    children: [
                        { name: "53300SSX228W1357", type: "device", status: "online" }
                    ]
                }
            ]
        },
        {
            name: "Biju Ramachandran",
            status: "online",
            children: [
                { name: "GW4000-DT", status: "online", children: [{ name: "SN-BIJU-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "CAPITAL ASSOCIATES",
            status: "online",
            children: [
                { name: "GW50K-MT", status: "online", children: [{ name: "SN-CAP-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "DR KASIM",
            status: "online",
            children: [
                { name: "GW3000-NS", status: "online", children: [{ name: "SN-KASIM-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "DR RAVI",
            status: "online",
            children: [
                { name: "GW6000-ES", status: "online", children: [{ name: "SN-RAVI-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "GIRIJA",
            status: "offline",
            children: [
                { name: "GW3600-DS", status: "offline", children: [{ name: "SN-GIRI-001", type: "device", status: "offline" }] }
            ]
        },
        {
            name: "HARIS",
            status: "online",
            children: [
                { name: "GW5000-MS", status: "online", children: [{ name: "SN-HARIS-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "Hyfa",
            status: "online",
            children: [
                { name: "GW8000-DT", status: "online", children: [{ name: "SN-HYFA-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "Junaid Thalassery",
            status: "offline",
            children: [
                { name: "GW10K-ET", status: "offline", children: [{ name: "SN-JUNA-001", type: "device", status: "offline" }] }
            ]
        },
        {
            name: "KRISHNAN",
            status: "online",
            children: [
                { name: "GW4200-NS", status: "online", children: [{ name: "SN-KRISH-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "Karthika",
            status: "online",
            children: [
                { name: "GW3000-SS", status: "online", children: [{ name: "SN-KARTH-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "MAKKAL",
            status: "offline",
            children: [
                { name: "GW5000-ES", status: "offline", children: [{ name: "SN-MAKK-001", type: "device", status: "offline" }] }
            ]
        },
        {
            name: "MITHUN",
            status: "online",
            children: [
                { name: "GW2500-XS", status: "online", children: [{ name: "SN-MITH-001", type: "device", status: "online" }] }
            ]
        },
        {
            name: "MOHAMMAD",
            status: "online",
            children: [
                { name: "GW6000-EH", status: "online", children: [{ name: "SN-MOHD-001", type: "device", status: "online" }] }
            ]
        }
    ];
const plantList = [
    "BINU", "Biju Ramachandran", "CAPITAL ASSOCIATES",
    "DR KASIM", "DR RAVI", "GIRIJA", "HARIS"
];

const locationList = {
    Global: ["India", "Nigeria"],
    India: ["Kerala", "Tamil Nadu", "Karnataka"],
    Nigeria: ["Lagos", "Kano"]
};

const organizationList = [
    "Vertex 02",
    "Green Power Ltd",
    "Solar Tech Corp"
];
let locationPath = []; // e.g. ["Global", "India", "Kerala"]
let searchKeyword = '';

const dataTabs = document.querySelectorAll('.data-tab');
const searchInput = document.getElementById('data-search-input');
const dropdown = document.getElementById('data-search-dropdown');

if (!searchInput || !dropdown || !dataTabs.length) return;

dataTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dataTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        activeDataType = tab.dataset.type;
        dropdown.classList.add('hidden');
        searchInput.value = ''; // ✅ clear previous value

        if (activeDataType === 'plant') {
            searchInput.placeholder = 'Select a plant / SN';
        } else if (activeDataType === 'location') {
            searchInput.placeholder = 'Select location';
        } else if (activeDataType === 'organization') {
            searchInput.placeholder = 'Select organization';
        }
    });
});
function renderList(items) {
    const filtered = items.filter(item =>
        item.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    if (!filtered.length) {
        dropdown.innerHTML += `
            <div class="dropdown-empty">No results found</div>
        `;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = item;
        div.onclick = () => selectItem(item);
        dropdown.appendChild(div);
    });
}

function renderGroup(title, items) {
    const header = document.createElement('div');
    header.className = 'dropdown-header';
    header.textContent = title;
    dropdown.appendChild(header);

    renderList(items);
}


function selectItem(value) {
    searchInput.value = value;
    dropdown.classList.add('hidden');
}
searchInput.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.innerHTML = '';
    dropdown.classList.remove('hidden');

    // ✅ PLANT
    if (activeDataType === 'plant') {
        renderList(plantList);
    }

    // ✅ LOCATION (drill-down)
    else if (activeDataType === 'location') {
        locationPath = [];
        renderLocationLevel('Global');
    }

    // ✅ ORGANIZATION
    else if (activeDataType === 'organization') {
        renderList(organizationList);
    }
});
searchInput.addEventListener('input', e => {
    searchKeyword = e.target.value.trim();
    dropdown.innerHTML = '';

    if (activeDataType === 'plant') {
        renderList(plantList);
    }
    else if (activeDataType === 'organization') {
        renderList(organizationList);
    }
    else if (activeDataType === 'location') {
        const current = locationPath.at(-1) || 'Global';
        renderLocationLevel(current);
    }
});




// ✅ prevent auto-close when clicking inside
dropdown.addEventListener('click', e => {
    e.stopPropagation();
});

document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
});
function updateLocationInput(final = false) {
    searchInput.value = locationPath.join(' / ');

    if (final) {
        console.log('Selected Location:', locationPath);
        // 🔥 later send this to API
    }
}

function renderLocationLevel(level) {
    dropdown.innerHTML = '';

    // 🔙 Back option
    if (locationPath.length > 0) {
        const back = document.createElement('div');
        back.className = 'dropdown-back';
        back.textContent = '← Back';
        back.onclick = () => {
            locationPath.pop();
            const prev = locationPath.at(-1) || 'Global';
            renderLocationLevel(prev);
            updateLocationInput();
        };
        dropdown.appendChild(back);
    }

const items = getLocationChildren(level).filter(item =>
    item.toLowerCase().includes(searchKeyword.toLowerCase())
);

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = item;

        div.onclick = () => {
            locationPath.push(item);

            const next = getLocationChildren(item);
            if (next.length > 0) {
                renderLocationLevel(item);
                updateLocationInput();
            } else {
                // ✅ Final selection
                updateLocationInput(true);
                dropdown.classList.add('hidden');
            }
        };

        dropdown.appendChild(div);
    });
}
function getLocationChildren(key) {
    if (key === 'Global') {
        return locationList.Global || [];
    }
    return locationList[key] || [];
}


    // 2. DOM Elements
    const treeContainer = document.querySelector('.tree-view');
    const selectedListContainer = document.querySelector('.selected-list');
    const indicatorContainer = document.querySelector('.checkbox-list');

    treeContainer.innerHTML = '';
    selectedListContainer.innerHTML = '';
    indicatorContainer.innerHTML = '';
    // STATUS → COLOR MAPPING (frontend only)
    function getStatusClass(status) {
        if (status === "online") return "green";
        if (status === "offline") return "blue";
        return "blue";
    }

    function getIndicatorsFor(name) {
        let indicators = [...indicatorSchema];
        if (name === "BINU" || name.includes("GW3300") || name.includes("53300")) {
            return indicators;
        } else if (name.includes("CAP") || name.includes("SN-CAP")) {
            return indicators.slice(0, 6);
        } else if (name.includes("KASIM") || name.includes("SN-KASIM")) {
            return indicators.map(i => i.replace("(A)", "(mA)"));
        } else {
            return indicators.filter((_, i) => i % 2 === 0);
        }
    }

    function renderIndicators(name) {
        indicatorContainer.innerHTML = '';
        if (!name) return;

        getIndicatorsFor(name).forEach(text => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + text));
            indicatorContainer.appendChild(label);
        });
    }

    function renderTree(container, nodes, level = 0, parentStack = []) {

        nodes.forEach(node => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'tree-node-wrapper';

            const rowDiv = document.createElement('div');
            rowDiv.className = level === 0 ? 'tree-item' : (node.type === 'device' ? 'tree-sub-item active-sub' : 'tree-item');
            if (level > 0 && node.type !== 'device') rowDiv.classList.add('tree-child-item');

            const hasChildren = node.children && node.children.length > 0;
            if (hasChildren) {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-angle-right toggle-icon';
                rowDiv.appendChild(icon);
            }

            if (node.status) {
                const dot = document.createElement('span');
                dot.className = `status-dot ${getStatusClass(node.status)}`;
                rowDiv.appendChild(dot);
            }

            if (node.type === 'device') {
                const box = document.createElement('div');
                box.className = 'sub-item-box';
                box.textContent = node.name;
                rowDiv.appendChild(box);

                const addIcon = document.createElement('i');
                addIcon.className = 'fa-solid fa-file-import add-icon';
                addIcon.onclick = e => {
                    e.stopPropagation();
                    addToSelected(node, parentStack);
                };

                rowDiv.appendChild(addIcon);
            } else {
                const paramSpan = document.createElement('span');
                paramSpan.className = 'item-name';
                paramSpan.textContent = node.name;
                rowDiv.appendChild(paramSpan);
            }

            itemDiv.appendChild(rowDiv);

            if (hasChildren) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children hidden';
                renderTree(childrenContainer, node.children, level + 1, [...parentStack, node]);

                itemDiv.appendChild(childrenContainer);

                rowDiv.addEventListener('click', () => {
                    const icon = rowDiv.querySelector('.toggle-icon');
                    if (childrenContainer.classList.contains('hidden')) {
                        childrenContainer.classList.remove('hidden');
                        icon.classList.replace('fa-angle-right', 'fa-angle-down');
                    } else {
                        childrenContainer.classList.add('hidden');
                        icon.classList.replace('fa-angle-down', 'fa-angle-right');
                    }
                });
            }
            container.appendChild(itemDiv);
        });
    }

    let activeSelectedName = null;
    const selectedItems = new Map();

    function addToSelected(node, parentStack) {
        const deviceName = node.name;
        if (selectedItems.has(deviceName)) return;

        const inverter = parentStack[parentStack.length - 1];
        const plant = parentStack[parentStack.length - 2];

        selectedItems.set(deviceName, {
            plant: plant?.name || "",
            inverter: inverter?.name || "",
            device: deviceName,
            status: node.status // 👈 REQUIRED
        });


        simulateSelection(deviceName);
    }


    function removeFromSelected(name) {
        selectedItems.delete(name);
        if (activeSelectedName === name) {
            activeSelectedName = null;
            renderIndicators(null);
        }
        renderSelected();
    }

    function simulateSelection(name) {
        activeSelectedName = name;
        renderSelected();
        renderIndicators(name);
    }

    // function renderSelected() {
    //     selectedListContainer.innerHTML = '';
    //     selectedItems.forEach(deviceName => {
    //         const div = document.createElement('div');
    //         div.className = 'tree-item selected-list-item';
    //         if (deviceName === activeSelectedName) {
    //             div.style.backgroundColor = '#e6fffa';
    //             div.style.border = '1px solid #00bc9c';
    //         }
    //         div.innerHTML = `
    //             <span class="item-name" style="flex:1">${deviceName}</span>
    //             <i class="fa-solid fa-trash-can delete-icon"></i>
    //         `;
    //         div.addEventListener('click', () => simulateSelection(deviceName));
    //         div.querySelector('.delete-icon').addEventListener('click', e => {
    //             e.stopPropagation();
    //             removeFromSelected(deviceName);
    //         });
    //         selectedListContainer.appendChild(div);
    //     });
    // }
    function renderSelected() {
        selectedListContainer.innerHTML = '';

        selectedItems.forEach((data, key) => {
            const div = document.createElement('div');
            div.className = 'selected-device-box';

            div.innerHTML = `
                <div class="selected-device-text">
                    <div class="selected-plant">
                        <span class="status-dot ${getStatusClass(data.status)}"></span>
                        ${data.plant}
                    </div>

                    <div class="selected-inverter">${data.inverter}</div>

                    <div class="selected-chip">${data.device}</div>
                </div>

                    <i class="fa-solid fa-trash-can delete-icon"></i>
                `;

            div.querySelector('.delete-icon').addEventListener('click', e => {
                e.stopPropagation();
                selectedItems.delete(key);
                renderSelected();
            });

            selectedListContainer.appendChild(div);
        });
    }

    renderTree(treeContainer, inverterData);

    // ---- TIME PICKER CODE (UNCHANGED) ----
    document.querySelectorAll('.time-input-wrapper input[type="time"]').forEach(input => {
        input.addEventListener('focus', () => {
            if (typeof input.showPicker === 'function') {
                input.showPicker();
            }
        });
        input.addEventListener('keydown', e => e.preventDefault());
        input.addEventListener('paste', e => e.preventDefault());
    });
        // ===============================
    // CLEAR ALL – SELECTED INVERTERS
    // ===============================
    const clearSelectedBtn = document.querySelector(
        '.column-card:nth-child(2) .clear-all'
    );

    if (clearSelectedBtn) {
        clearSelectedBtn.addEventListener('click', e => {
            e.preventDefault();
            selectedItems.clear();
            activeSelectedName = null;
            renderIndicators(null);
            renderSelected();
        });
    }

    // ===============================
    // SELECT ALL INDICATORS
    // ===============================
    const selectAllIndicatorsBtn = document.querySelector(
        '.column-card:nth-child(3) .select-all'
    );

    if (selectAllIndicatorsBtn) {
        selectAllIndicatorsBtn.addEventListener('click', e => {
            e.preventDefault();
            document
                .querySelectorAll('.checkbox-list input[type="checkbox"]')
                .forEach(cb => (cb.checked = true));
        });
    }

    // ===============================
    // CLEAR ALL INDICATORS
    // ===============================
    const clearIndicatorsBtn = document.querySelector(
        '.column-card:nth-child(3) .clear-all'
    );

    if (clearIndicatorsBtn) {
        clearIndicatorsBtn.addEventListener('click', e => {
            e.preventDefault();
            document
                .querySelectorAll('.checkbox-list input[type="checkbox"]')
                .forEach(cb => (cb.checked = false));
        });
    }

    // ===============================
    // RESET BUTTON
    // ===============================
    const resetBtn = document.querySelector('.btn-secondary');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    // ===============================
    // GENERATE DATA BUTTON
document.querySelector('.btn-primary')?.addEventListener('click', () => {

    const resultBox = document.getElementById('generated-result');
    const selectionSection = document.getElementById('selection-section');
    const targetList = document.getElementById('targetList');
    const timeRangeText = document.getElementById('timeRangeText');

    // 1. Build target list
    targetList.innerHTML = '';
    document
        .querySelectorAll('.checkbox-list input:checked')
        .forEach(cb => {
            const span = document.createElement('span');
            span.innerHTML = `<i class="fa-solid fa-check"></i> ${cb.parentElement.textContent.trim()}`;
            targetList.appendChild(span);
        });

    // 2. Time range
    const start = document.getElementById('startDateTime')?.value || '';
    const end = document.getElementById('endDateTime')?.value || '';
    timeRangeText.textContent = `${start.replace('T',' ')}  --  ${end.replace('T',' ')}`;

    // 3. TOGGLE VIEW (IMPORTANT)
    selectionSection.classList.add('hidden');   // ❌ hide table + filters
    resultBox.classList.remove('hidden');       // ✅ show summary on top
});

document.querySelector('.more-option-btn')?.addEventListener('click', () => {
    document.getElementById('generated-result').classList.add('hidden');
    document.getElementById('selection-section').classList.remove('hidden');
});
document.querySelector('.btn-export')?.addEventListener('click', () => {

    if (selectedItems.size === 0) {
        alert("Please select at least one inverter/device");
        return;
    }

    const selectedIndicators = Array.from(
        document.querySelectorAll('.checkbox-list input:checked')
    ).map(cb => cb.parentElement.textContent.trim());

    if (selectedIndicators.length === 0) {
        alert("Please select at least one indicator");
        return;
    }

    const start = document.getElementById('startDateTime')?.value || '';
    const end = document.getElementById('endDateTime')?.value || '';

    // ===============================
    // BUILD EXCEL ROWS
    // ===============================
    const rows = [];

    selectedItems.forEach(data => {
        selectedIndicators.forEach(indicator => {
            rows.push({
                Plant: data.plant,
                Inverter: data.inverter,
                Device_SN: data.device,
                Status: data.status,
                Indicator: indicator,
                Start_Time: start.replace('T', ' '),
                End_Time: end.replace('T', ' ')
            });
        });
    });

    // ===============================
    // CREATE EXCEL
    // ===============================
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solar Data");

    const fileName = `Solar_Data_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
});

    // ===============================
    // TOGGLE TIME SELECTION (RADIOS)
    // ===============================
    const dataTypeRadios = document.querySelectorAll('input[name="dataType"]');
    const timeRealTime = document.getElementById('time-selection-realtime');
    const timeEnergy = document.getElementById('time-selection-energy');

    dataTypeRadios.forEach(radio => {
        radio.addEventListener('change', e => {
            const labelText = e.target
                .closest('.radio-item')
                .textContent.trim();

            if (labelText.includes("Real-Time Parameters")) {
                timeRealTime.classList.remove('hidden');
                timeEnergy.classList.add('hidden');
            } else {
                timeRealTime.classList.add('hidden');
                timeEnergy.classList.remove('hidden');
            }
        });
    });

}
const saveBtn = document.querySelector('.btn-save');
const modal = document.getElementById('saveTemplateModal');
const closeModalBtn = document.getElementById('closeTemplateModal');

document.addEventListener('click', (e) => {

    // OPEN MODAL
    if (e.target.classList.contains('btn-save')) {
        document
            .getElementById('saveTemplateModal')
            ?.classList.remove('hidden');
    }

    // CLOSE MODAL (Cancel button)
    if (e.target.id === 'closeTemplateModal') {
        document
            .getElementById('saveTemplateModal')
            ?.classList.add('hidden');
    }

    // CLOSE MODAL (click outside)
    if (e.target.id === 'saveTemplateModal') {
        e.target.classList.add('hidden');
    }
});
