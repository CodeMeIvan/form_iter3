document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("testForm");
  const progressBar = document.getElementById("progressBar");

  if (!form) return;

  const fields = Array.from(
    form.querySelectorAll("input, select, textarea")
  );

  let lastProgressWidth = progressBar ? progressBar.style.width : "0%";

  function getFieldWrapper(field) {
    return field.closest(".field");
  }

  

  function getSectionHint(field) {
    const section = field.closest(".form-section");
    const supportHint = getSupportHint(field);
    if (supportHint) {
    supportHint.classList.add("hint-active");
    }
    if (!section) return null;
    return section.querySelector(".section-hint");
  }

  function getSupportHint(field) {
  const wrapper = field.closest(".field");

  if (!wrapper) return null;

  return wrapper.querySelector(".support-hint");
}

  function markProgressComplete() {
    if (!progressBar) return;

    const width = progressBar.style.width;

    if (width === "100%") {
      progressBar.classList.add("progress-complete");
    } else {
      progressBar.classList.remove("progress-complete");
    }
  }

  function pulseProgressBar() {
  if (!progressBar) return;

  progressBar.classList.remove("progress-pulse");
  void progressBar.offsetWidth;
  progressBar.classList.add("progress-pulse");

  setTimeout(() => {
    progressBar.classList.remove("progress-pulse");
  }, 600);
}

  function handleFocus(field) {
    const wrapper = getFieldWrapper(field);
    const hint = getSectionHint(field);

    if (wrapper) {
      wrapper.classList.add("focus-active");
    }

    if (hint) {
      hint.classList.add("hint-active");
    }

    if (field.id === "username") {
  document
    .getElementById("usernameHelper")
    ?.classList.add("helper-active");
}
  }

  function handleBlur(field) {
    const wrapper = getFieldWrapper(field);
    const hint = getSectionHint(field);
    const supportHint = getSupportHint(field);

    if (supportHint) {
    supportHint.classList.remove("hint-active");
    }

    if (wrapper) {
      wrapper.classList.remove("focus-active");
    }

    if (hint) {
      hint.classList.remove("hint-active");
    }

    

    window.requestAnimationFrame(() => {
      if (!progressBar) return;

      const currentWidth = progressBar.style.width;

      if (currentWidth !== lastProgressWidth) {
        pulseProgressBar();
        lastProgressWidth = currentWidth;
      }

      markProgressComplete();
    });

    if (field.id === "username") {
     document.getElementById("usernameHelper")
    ?.classList.remove("helper-active");
    }
  }

  function handlePasswordFocus(field) {
    const passwordBox = field
      .closest(".field")
      ?.querySelector(".password-box");

    if (passwordBox) {
      passwordBox.classList.add("password-active");
    }
  }

  function handlePasswordBlur(field) {
    const passwordBox = field
      .closest(".field")
      ?.querySelector(".password-box");

    if (passwordBox) {
      passwordBox.classList.remove("password-active");
    }
  }

  fields.forEach((field) => {
    field.addEventListener("focus", () => {
  handleFocus(field);

  if (field.id === "password") {
    handlePasswordFocus(field);
  }

  if (window.innerWidth <= 640 && field.id === "password") {
    setTimeout(() => {
      field.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 250);
  }
});

    field.addEventListener("blur", () => {
      handleBlur(field);

      if (field.id === "password") {
        handlePasswordBlur(field);
      }
    });

    
  });

  if (form) {
    form.addEventListener("submit", () => {
      window.requestAnimationFrame(markProgressComplete);
    });
  }
});

