function initSubTabs() {
    const buttons = document.querySelectorAll(".table-button .table");
    const tables = document.querySelectorAll(".sub-table");

    if (!buttons.length || !tables.length) {
        console.log("initSubTabs: no sub-tabs on this page");
        return;
    }

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            tables.forEach(t => t.style.display = "none");

            const target = btn.getAttribute("data-target");
            const selectedTable = document.querySelector(target);
            if (selectedTable) selectedTable.style.display = "block";

            console.log("Selected:", btn.innerText.trim());
        });
    });

    console.log("subTabs.js initialized");
}

// expose globally
window.initSubTabs = initSubTabs;

/* ---------------- RFID TOOLTIP ---------------- */
function initRFIDTooltip() {
    console.log("initRFIDTooltip: called");

    const infoBtn = document.getElementById("rfidInfoBtn");
    const tooltip = document.getElementById("rfidTooltip");

    if (!infoBtn || !tooltip) {
        console.log("initRFIDTooltip: elements not found, skipping");
        return; // no tooltip on this tab
    }

    let isOpen = false;

    infoBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        isOpen = !isOpen;

        tooltip.style.display = isOpen ? "block" : "none";

        const rect = infoBtn.getBoundingClientRect();

        // ⭐ Position tooltip to the RIGHT side (like Figma)
        tooltip.style.position = "absolute";
        tooltip.style.top = rect.top + window.scrollY - 10 + "px";
        tooltip.style.left = rect.right + window.scrollX + 15 + "px";

        console.log("initRFIDTooltip: toggled, open =", isOpen);
    });


    document.addEventListener("click", () => {
        if (!isOpen) return;
        tooltip.style.display = "none";
        isOpen = false;
        console.log("initRFIDTooltip: closed by outside click");
    });
}

window.initRFIDTooltip = initRFIDTooltip;

window.initRFIDModal = function () {
    const openBtn = document.querySelector(".next-btn"); // Add RFID Card button
    const modal = document.getElementById("rfidModal");
    const cancelBtn = document.getElementById("rfidCancel");

    if (!openBtn || !modal) {
        console.log("RFID modal not found");
        return;
    }

    // OPEN MODAL
    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // CLOSE MODAL
    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // CLOSE when clicking outside the modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    console.log("RFID Modal initialized");
};


/* ---------------------------
   DUMMY DATA (simulate API)
----------------------------*/
const dummyInverterData = [
    {
        status: "Online",
        name: "GW15K-SDT-30",
        sn: "5015KDTG248LO018",
        model: "GW15K-SDT-30",
        capacity: "15 kW",
        creationDate: "02.27.2025",
        dataLogger: "72001WLA24810891"
    },
    {
        status: "Offline",
        name: "pppp",
        sn: "99999",
        model: "GW15K-SDT-30",
        capacity: "15 kW",
        creationDate: "02.27.2025",
        dataLogger: "72001WLA24810891"
    }
];

const dummyReplaceData = [
    {
        number: 1,
        originalDevice: "GW10KT",
        originalSN: "123456789",
        newDevice: "GW15K-SDT-30",
        newSN: "987654321",
        replacementDate: "02.27.2025"
    }
];

/* ---------------------------------------
   LOAD INVERTER TABLE WITH DATA
---------------------------------------*/
function loadInverterTable(data) {
    const body = document.getElementById("invTableBody");
    if (!body) return;

    body.innerHTML = "";

    if (data.length === 0) {
        body.innerHTML = `<tr><td colspan="8" class="no-data">No data</td></tr>`;
        return;
    }

    data.forEach(item => {
    body.innerHTML += `
        <tr>
            <td style="color:#00A76F;">${item.status}</td>
            <td>${item.name}</td>
            <td>${item.sn}</td>
            <td>${item.model}</td>
            <td>${item.capacity}</td>
            <td>${item.creationDate}</td>
            <td>${item.dataLogger}</td>

            <td style="display:flex; gap:10px; align-items:center; justify-content:center;">
                <span class="action modify"  style="color:blue; cursor:pointer;">Modify</span>
                <span class="action replace"  style="color:#008000; cursor:pointer;">Replace</span>

                <!-- ⭐ Store row values inside attributes -->
                <span class="action delete"
                      data-name="${item.name}"
                      data-sn="${item.sn}"
                      style="color:#FF0000; cursor:pointer;">Delete</span>
            </td>
        </tr>
    `;
});


    // Rebind ALL modals
    if (window.initModifyModal) initModifyModal();
    if (window.initReplaceModal) initReplaceModal();
    if (window.initDeleteModal) initDeleteModal();
}

/* ---------------------------------------
   LOAD REPLACEMENT TABLE
---------------------------------------*/
function loadReplaceHistoryTable(data) {
    const body = document.getElementById("replaceTableBody");
    if (!body) return;

    body.innerHTML = "";

    if (data.length === 0) {
        body.innerHTML = `<tr><td colspan="7" class="no-data">No data</td></tr>`;
        return;
    }

    data.forEach(item => {
        body.innerHTML += `
            <tr>
                <td>${item.number}</td>
                <td>${item.originalDevice}</td>
                <td>${item.originalSN}</td>
                <td>${item.newDevice}</td>
                <td>${item.newSN}</td>
                <td>${item.replacementDate}</td>
                <td><span class="action delete">Delete</span></td>
            </tr>
        `;
    });
}

/* ---------------------------------------
   SUB TAB SWITCHING FUNCTION
---------------------------------------*/
function initSubTabs() {
    const buttons = document.querySelectorAll(".table-button .table");
    const tables = document.querySelectorAll(".sub-table");

    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            tables.forEach(t => t.style.display = "none");

            const target = btn.getAttribute("data-target");
            const selectedTable = document.querySelector(target);
            if (selectedTable) selectedTable.style.display = "block";

            console.log("Selected:", btn.innerText.trim());

            /* Load data depending on selected tab */
            if (target === "#invTable") {
                loadInverterTable(dummyInverterData);
            }
            if (target === "#replaceTable") {
                loadReplaceHistoryTable(dummyReplaceData);
            }
        });
    });

    console.log("subTabs.js initialized");
}

/* Run default loading when file opens */
window.addEventListener("DOMContentLoaded", () => {
    loadInverterTable(dummyInverterData);
});


// modal for modify
window.initModifyModal = function () {

    const modal = document.getElementById("modifyModal");
    if (!modal) return;

    const cancelBtn = document.getElementById("modifyCancel");

    // Remove old listeners to avoid duplicates
    document.querySelectorAll(".action.modify").forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    // Attach new listeners
    document.querySelectorAll(".action.modify").forEach((btn, index) => {
        btn.addEventListener("click", () => {

            document.getElementById("modifyName").value = dummyInverterData[index].name;
            document.getElementById("modifySN").value = dummyInverterData[index].sn;

            modal.style.display = "flex";
        });
    });

    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    console.log("Modify Modal initialized");
};
// modal for REPLACE
window.initReplaceModal = function () {
    const modal = document.getElementById("replaceModal");
    if (!modal) return;

    const cancelBtn = document.getElementById("replaceCancel");

    // CLICK EVENT FOR EACH "Replace"
    document.querySelectorAll(".action.replace").forEach(btn => {
        btn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    });

    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    console.log("Replace Modal initialized");
};

// modal for DELETE
window.initDeleteModal = function () {
    const modal = document.getElementById("deleteModal");
    if (!modal) return;

    const cancelBtn = document.getElementById("deleteCancel");
    const nameField = document.getElementById("deleteName");
    const snField = document.getElementById("deleteSN");

    // Remove old listeners
    document.querySelectorAll(".action.delete").forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });

    // Re-select after cloning
    document.querySelectorAll(".action.delete").forEach(btn => {
        btn.addEventListener("click", () => {

            // ⭐ Read values from HTML attributes
            const name = btn.getAttribute("data-name");
            const sn   = btn.getAttribute("data-sn");

            nameField.textContent = "Name: " + name;
            snField.textContent   = "SN: " + sn;

            modal.style.display = "flex";
        });
    });

    cancelBtn.addEventListener("click", () => modal.style.display = "none");

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    console.log("Delete Modal initialized");
};

