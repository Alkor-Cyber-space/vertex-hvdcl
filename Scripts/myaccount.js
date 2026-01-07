// My Account – Enable input on Change/Add
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".account-action");
  if (!btn) return;

  // Ignore empty action column
  if (!btn.textContent.trim()) return;

  const row = btn.closest(".account-row");
  const input = row?.querySelector("input");

  if (!input) return;

  // ENABLE MODE
  if (btn.textContent === "Change" || btn.textContent === "Add") {
    input.disabled = false;
    input.focus();
    btn.textContent = "Save";
    return;
  }

  // SAVE MODE
  if (!input.value.trim()) {
    alert("Value cannot be empty");
    return;
  }

  console.log("Saved:", input.value); // API later

  input.disabled = true;
  btn.textContent = "Change";
});
