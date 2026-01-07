/* ===============================
   ORGANIZATION PAGE INIT
================================ */
function initOrganizationPage() {

  /* ===============================
     CONSTANTS
  ================================ */
  const TEMP_ORG_ID = "__NEW__";

  /* ===============================
     DUMMY DATA
  ================================ */
  const organizations = [
    {
      id: 1,
      name: "Vertex Energy",
      code: "VERTEX001",
      representativeName: "Nithin",
      representativeCode: "VRX-01",
      email: "info@vertexgroup.in"
    },
    {
      id: 2,
      name: "Capital Associates",
      code: "CAP002",
      representativeName: "Rahul",
      representativeCode: "CAP-12",
      email: "contact@capital.com"
    },
    {
      id: 3,
      name: "Solar Grid Pvt Ltd",
      code: "SOLAR003",
      representativeName: "Anil",
      representativeCode: "SG-77",
      email: "admin@solargrid.in"
    }
  ];

  /* ===============================
     DOM REFERENCES
  ================================ */
  const listEl = document.getElementById("organizationList");
  const orgNameInput  = document.getElementById("orgName");
  const orgCodeInput  = document.getElementById("orgCode");
  const orgEmailInput = document.getElementById("orgEmail");
  const repNameInput  = document.getElementById("repName");
  const repCodeInput  = document.getElementById("repCode");
  const searchBtn     = document.querySelector(".btn-search");
  const searchInput   = document.querySelector(".search-bar input");
  const addBtn        = document.getElementById("btnAddOrganization");
  const cancelBtn     = document.querySelector(".btn-cancel");
  const submitBtn     = document.getElementById("btnSubmitOrg");
const deleteBtn   = document.getElementById("btnDeleteOrganization");
const deleteModal = document.getElementById("deleteConfirmModal");
const confirmDel  = document.getElementById("confirmDelete");
const cancelDel   = document.getElementById("cancelDelete");

  let isAddMode = false;
  let editingOrgId = null;

  if (!listEl || !searchBtn) {
    console.warn("Organization DOM missing");
    return;
  }

  /* ===============================
     CLEAR FORM (➕ ADD MODE)
  ================================ */
  function clearForm() {
    orgNameInput.value  = "";
    orgCodeInput.value  = "";
    orgEmailInput.value = "";
    repNameInput.value  = "";
    repCodeInput.value  = "";

    isAddMode = true;
    editingOrgId = TEMP_ORG_ID;

    // remove active highlight
    document
      .querySelectorAll(".organization-list-item")
      .forEach(i => i.classList.remove("active"));

    // add temp item if missing
    if (!organizations.find(o => o.id === TEMP_ORG_ID)) {
      organizations.push({
        id: TEMP_ORG_ID,
        name: "Add organization",
        code: "",
        email: "",
        representativeName: "",
        representativeCode: ""
      });
    }

    renderList();

    // activate temp item
const tempItem = [...listEl.children].find(
  el => el.textContent === "Add organization"
);

if (tempItem) {
  tempItem.classList.add("active", "add-mode");
}


    orgNameInput.focus();
  }

  /* ===============================
     RENDER LIST
  ================================ */
function renderList() {
  listEl.innerHTML = "";

  organizations.forEach(org => {
    const item = document.createElement("div");
    item.className = "organization-list-item";
    item.textContent = org.name;

    if (org.id === TEMP_ORG_ID) {
      item.classList.add("add-mode");
    }

    item.onclick = () => {
      fillForm(org);
      setActive(item);
    };

    listEl.appendChild(item);
  });
}

  function fillForm(org) {
    orgNameInput.value  = org.name || "";
    orgCodeInput.value  = org.code || "";
    orgEmailInput.value = org.email || "";
    repNameInput.value  = org.representativeName || "";
    repCodeInput.value  = org.representativeCode || "";

    isAddMode = org.id === TEMP_ORG_ID;
    editingOrgId = org.id;
  }

  function setActive(el) {
    document
      .querySelectorAll(".organization-list-item")
      .forEach(i => i.classList.remove("active"));
    el.classList.add("active");
  }

  /* ===============================
     SEARCH
  ================================ */
searchBtn.onclick = () => {
  const value = searchInput.value.trim().toUpperCase();
  if (!value) return;

  // ignore temp item
  const found = organizations.find(
    o => o.id !== TEMP_ORG_ID && o.code.toUpperCase() === value
  );

  if (!found) {
    alert("Organization not found");
    return;
  }

  // fill form
  fillForm(found);

  // highlight left list item
  const items = [...listEl.children];
  items.forEach(i => i.classList.remove("active"));

  const matchItem = items.find(
    el => el.textContent.trim() === found.name
  );

  if (matchItem) {
    matchItem.classList.add("active");
    matchItem.scrollIntoView({ block: "nearest" });
  }
};

  /* ===============================
     SUBMIT (REPLACE TEMP ITEM)
  ================================ */
  submitBtn?.addEventListener("click", () => {

    const name  = orgNameInput.value.trim();
    const code  = orgCodeInput.value.trim();
    const email = orgEmailInput.value.trim();
    const repN  = repNameInput.value.trim();
    const repC  = repCodeInput.value.trim();

    if (!name || !code || !email) {
      alert("Please fill required fields");
      return;
    }

    const newOrg = {
      id: Date.now(),
      name,
      code,
      email,
      representativeName: repN,
      representativeCode: repC
    };

    const tempIndex = organizations.findIndex(o => o.id === TEMP_ORG_ID);

    if (tempIndex !== -1) {
      organizations[tempIndex] = newOrg; // ✅ replace
    } else {
      organizations.push(newOrg);
    }

    renderList();

    const lastItem = listEl.lastChild;
    fillForm(newOrg);
    setActive(lastItem);

    isAddMode = false;
  });

  /* ===============================
     ADD & CANCEL BUTTONS
  ================================ */
  addBtn?.addEventListener("click", clearForm);

  cancelBtn?.addEventListener("click", () => {
    const idx = organizations.findIndex(o => o.id === TEMP_ORG_ID);
    if (idx !== -1) {
      organizations.splice(idx, 1);
      renderList();
    }
    fillForm(organizations[0]);
    listEl.firstChild?.classList.add("active");
  });
  deleteBtn?.addEventListener("click", () => {

  if (!editingOrgId || editingOrgId === TEMP_ORG_ID) {
    alert("Please select a saved organization to delete");
    return;
  }

  deleteModal.classList.add("show");
});
cancelDel?.addEventListener("click", () => {
  deleteModal.classList.remove("show");
});
confirmDel?.addEventListener("click", () => {

  const index = organizations.findIndex(o => o.id === editingOrgId);
  if (index === -1) return;

  organizations.splice(index, 1);

  deleteModal.classList.remove("show");
  renderList();

  // select first org if exists
  if (organizations.length) {
    fillForm(organizations[0]);
    listEl.firstChild?.classList.add("active");
  } else {
    clearForm();
  }
});


  /* ===============================
     INIT
  ================================ */
  renderList();
  fillForm(organizations[0]);
  listEl.firstChild.classList.add("active");
}
