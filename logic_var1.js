document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".help-toggle");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const hint = document.getElementById(targetId);

      if (!hint) return;

      hint.classList.toggle("visible");
    });
  });
});