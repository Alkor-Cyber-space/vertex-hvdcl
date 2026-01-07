document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // UPLOAD HANDLING
  // ===============================
  document.querySelectorAll(".upload-box").forEach(box => {
    const input = box.querySelector("input");
    const preview = box.querySelector(".preview");
    const plus = box.querySelector(".plus");

    const minW = Number(box.dataset.minWidth);
    const minH = Number(box.dataset.minHeight);

    // Click box → open file picker
    box.addEventListener("click", () => input.click());

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      const img = new Image();

      reader.onload = e => img.src = e.target.result;

      img.onload = () => {
        if (img.width < minW || img.height < minH) {
          alert(`Image must be at least ${minW}×${minH}px`);
          input.value = "";
          return;
        }

        preview.src = img.src;
        preview.style.display = "block";
        plus.style.display = "none";
      };

      reader.readAsDataURL(file);
    });
  });

  // ===============================
  // RESET BUTTON (🔥 REQUIRED)
  // ===============================
  document.querySelector(".btn-reset")?.addEventListener("click", () => {
    document.querySelectorAll(".upload-box").forEach(box => {
      const input = box.querySelector("input");
      const preview = box.querySelector(".preview");
      const plus = box.querySelector(".plus");

      // Clear everything
      input.value = "";
      preview.src = "";
      preview.style.display = "none";
      plus.style.display = "block";
    });
  });

});
