console.log("alarmOwner.js loaded");

// 🔹 Wait until required elements exist
function waitForAlarmOwnerElements(callback) {
  const interval = setInterval(() => {
    const searchInput = document.getElementById("searchInput");
    const ownerList = document.getElementById("ownerList");
    const plantField = document.getElementById("plantField");
    const emailField = document.getElementById("emailField");
    const saveBtn = document.querySelector(".btn.save");
    const resetBtn = document.querySelector(".btn.reset");

    if (searchInput && ownerList && plantField && emailField && saveBtn && resetBtn) {
      clearInterval(interval);
      callback({
        searchInput,
        ownerList,
        plantField,
        emailField,
        saveBtn,
        resetBtn
      });
    }
  }, 50);
}

waitForAlarmOwnerElements(initAlarmOwner);

// 🔹 MAIN LOGIC
function initAlarmOwner({
  searchInput,
  ownerList,
  plantField,
  emailField,
  saveBtn,
  resetBtn
}) {
  console.log("Alarm Owner initialized");

  const mockPlants = [
    { plant_name: "BINU", owner_email: "binu@mail.com" },
    { plant_name: "CAPITAL ASSOCIATES", owner_email: "capital@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },
    { plant_name: "GIRIJA", owner_email: "girija@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },
    { plant_name: "GIRIJA", owner_email: "girija@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },    { plant_name: "GIRIJA", owner_email: "girija@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },    { plant_name: "GIRIJA", owner_email: "girija@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },    { plant_name: "GIRIJA", owner_email: "girija@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },    { plant_name: "GIRIJA", owner_email: "girija@mail.com" },
    { plant_name: "DR KASIM", owner_email: "kasim@mail.com" },
    { plant_name: "DR RAVI", owner_email: "ravi@mail.com" },
    { plant_name: "GIRIJA", owner_email: "girija@mail.com" }
  ];

  function disableSave() {
    saveBtn.disabled = true;
    saveBtn.classList.remove("active");
  }

  function enableSave() {
    saveBtn.disabled = false;
    saveBtn.classList.add("active");
  }

  function resetForm() {
    plantField.value = "";
    plantField.placeholder = "Please Select Plant";
    emailField.value = "";
    emailField.placeholder = "-";

    ownerList.querySelectorAll("li").forEach(li =>
      li.classList.remove("active")
    );

    disableSave();
  }

  // 🔹 Render list
  ownerList.innerHTML = "";
  mockPlants.forEach(plant => {
    const li = document.createElement("li");
    li.textContent = plant.plant_name;
    li.dataset.plant = plant.plant_name;
    li.dataset.email = plant.owner_email;
    ownerList.appendChild(li);
  });

  resetForm();

  // 🔹 Search
  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    ownerList.querySelectorAll("li").forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(value)
        ? "block"
        : "none";
    });
  });

  // 🔹 Select plant
  ownerList.addEventListener("click", e => {
    const item = e.target.closest("li");
    if (!item) return;

    ownerList.querySelectorAll("li").forEach(li =>
      li.classList.remove("active")
    );
    item.classList.add("active");

    plantField.value = item.dataset.plant;
    emailField.value = item.dataset.email;

    enableSave();
  });

  // 🔹 Reset
  resetBtn.addEventListener("click", resetForm);
}
