document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("testForm");

  if (!form) return;

  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  const fields = Array.from(
    form.querySelectorAll("input, select")
  );

  const deliverySection =
    document.getElementById("deliverySection");

  const differentDeliveryRadios =
    document.querySelectorAll(
      'input[name="differentDelivery"]'
    );

  const postalCode =
    document.getElementById("postalCode");

  const city =
    document.getElementById("city");

  const deliveryPostalCode =
    document.getElementById("deliveryPostalCode");

  const deliveryCity =
    document.getElementById("deliveryCity");

  const username =
    document.getElementById("username");

  const usernameStatus =
    document.getElementById("usernameStatus");

  const password =
    document.getElementById("password");

  const passwordRepeat =
    document.getElementById("passwordRepeat");

  const passwordStrengthBar =
    document.getElementById("passwordStrengthBar");

  const passwordStrengthLabel =
    document.getElementById("passwordStrengthLabel");

  const cancelButton =
    document.getElementById("cancelButton");

  const cityLookup = {
    "10115": "Berlin",
    "20095": "Hamburg",
    "30159": "Hannover",
    "50667": "Köln",
    "60311": "Frankfurt am Main",
    "70173": "Stuttgart",
    "80331": "München"
  };

  const takenUsernames = [
    "admin",
    "shop",
    "maxmustermann",
    "test123",
    "kunde"
  ];

  function setMessage(fieldId, message, isError = false) {

    const el =
      document.getElementById(fieldId + "Message");

    if (!el) return;

    el.textContent = message || "";

    el.className =
      "field-message" + (isError ? " error" : "");
  }

  function markFieldState(field) {

    if (!field) return;

    field.classList.remove("valid", "invalid");

    if (field.value.trim() === "") {

      setMessage(field.id, "");
      return;
    }

    if (field.checkValidity()) {

      field.classList.add("valid");
      setMessage(field.id, "");

    } else {

      field.classList.add("invalid");

      setMessage(
        field.id,
        field.validationMessage ||
        "Bitte prüfen Sie Ihre Eingabe.",
        true
      );
    }
  }

  function updateConditionalRequired() {

    const showDelivery =
      document.querySelector(
        'input[name="differentDelivery"]:checked'
      )?.value === "yes";

    deliverySection.classList.toggle(
      "visible",
      showDelivery
    );

    const conditionalFields = [
      document.getElementById("deliveryStreet"),
      document.getElementById("deliveryHouseNumber"),
      document.getElementById("deliveryPostalCode"),
      document.getElementById("deliveryCity")
    ];

    conditionalFields.forEach((field) => {

      if (!field) return;

      field.required = showDelivery;

      if (!showDelivery) {

        field.classList.remove("valid", "invalid");
        setMessage(field.id, "");
      }
    });

    updateProgress();
  }

  function autoFillCity(zipField, cityField) {

    if (!zipField || !cityField) return;

    const zip = zipField.value.trim();

    if (/^\d{5}$/.test(zip) && cityLookup[zip]) {

      cityField.value = cityLookup[zip];

      cityField.classList.add("valid");
      cityField.classList.remove("invalid");

      setMessage(cityField.id, "");
    }
  }

  function updateUsernameAvailability() {

    const value =
      username.value.trim().toLowerCase();

    usernameStatus.textContent = "";
    usernameStatus.className = "username-status";

    if (
      value.length < 4 ||
      !username.checkValidity()
    ) {
      return;
    }

    if (takenUsernames.includes(value)) {

      usernameStatus.textContent =
        "Benutzername ist bereits vergeben.";

      usernameStatus.classList.add("taken");

      username.setCustomValidity(
        "Benutzername nicht verfügbar."
      );

      username.classList.remove("valid");
      username.classList.add("invalid");

    } else {

      usernameStatus.textContent =
        "Benutzername ist verfügbar.";

      usernameStatus.classList.add("available");

      username.setCustomValidity("");

      username.classList.remove("invalid");
      username.classList.add("valid");
    }
  }

  function setRuleState(ruleId, fulfilled) {

  const rule =
    document.getElementById(ruleId);

  if (!rule) return;

  const icon =
    rule.querySelector(".rule-icon");

  const wasFulfilled =
    rule.classList.contains("fulfilled");

  rule.classList.toggle(
    "fulfilled",
    fulfilled
  );

  if (
    fulfilled &&
    !wasFulfilled &&
    document.body.classList.contains("variant-2")
  ) {
    rule.classList.remove("rule-activated");

    void rule.offsetWidth;

    rule.classList.add("rule-activated");

    setTimeout(() => {
      rule.classList.remove("rule-activated");
    }, 500);
  }

  if (icon) {

    icon.textContent =
      fulfilled ? "✓" : "✕";
  }
}

  function updatePasswordFeedback() {

    const value = password.value;

    const hasLength =
      value.length >= 8 &&
      value.length <= 13;

    const hasUppercase =
      /[A-ZÄÖÜ]/.test(value);

    const hasNumber =
      /\d/.test(value);

    const hasSpecial =
      /[^A-Za-z0-9ÄÖÜäöüß]/.test(value);

    const strongLength =
      value.length >= 10;

    setRuleState("ruleLength", hasLength);
    setRuleState("ruleUppercase", hasUppercase);
    setRuleState("ruleNumber", hasNumber);
    setRuleState("ruleSpecial", hasSpecial);
    setRuleState("ruleStrong", strongLength);

    let score = 0;

    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (strongLength) score++;

    let width = 0;
    let color = "#ef4444";
    let label = "Noch keine Eingabe";

    if (value.length === 0) {

      width = 0;

    } else if (score <= 2) {

      width = 33;
      color = "#ef4444";
      label = "Schwach";

    } else if (score <= 4) {

      width = 66;
      color = "#f59e0b";
      label = "Mittel";

    } else {

      width = 100;
      color = "#16a34a";
      label = "Stark";
    }

    passwordStrengthBar.style.width =
      width + "%";

    passwordStrengthBar.style.background =
      color;

    passwordStrengthLabel.textContent =
      label;

    const passwordValid =
      hasLength &&
      hasUppercase &&
      hasNumber &&
      hasSpecial;

    password.setCustomValidity(
      passwordValid
        ? ""
        : "Das Passwort erfüllt die Mindestanforderungen noch nicht."
    );

    if (passwordRepeat.value.trim() !== "") {
      validatePasswordRepeat();
    }

    markFieldState(password);

    updateProgress();
  }

  function validatePasswordRepeat() {

    if (passwordRepeat.value.trim() === "") {

      passwordRepeat.setCustomValidity(
        "Bitte wiederholen Sie Ihr Passwort."
      );

    } else if (
      passwordRepeat.value !== password.value
    ) {

      passwordRepeat.setCustomValidity(
        "Die Passwörter stimmen nicht überein."
      );

    } else {

      passwordRepeat.setCustomValidity("");
    }

    markFieldState(passwordRepeat);
  }

  function getTrackedFields() {

    return fields.filter((field) => {

      if (!field.name) return false;

      if (field.type === "radio") {
        return field.checked;
      }

      if (
        !deliverySection.classList.contains(
          "visible"
        )
      ) {

        if (
          [
            "deliveryStreet",
            "deliveryHouseNumber",
            "deliveryPostalCode",
            "deliveryCity"
          ].includes(field.id)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  function updateProgress() {

    const tracked = getTrackedFields();

    const requiredTracked =
      tracked.filter((field) => {

        if (field.type === "radio") return true;

        return field.required;
      });

    let completed = 0;

    requiredTracked.forEach((field) => {

      if (field.type === "radio") {

        const groupValue =
          document.querySelector(
            'input[name="differentDelivery"]:checked'
          );

        if (groupValue) completed++;

        return;
      }

      if (
        field.checkValidity() &&
        field.value.trim() !== ""
      ) {
        completed++;
      }
    });

    const total =
      requiredTracked.length || 1;

    const percent =
      Math.round((completed / total) * 100);

    progressBar.style.width =
      percent + "%";

    progressText.textContent =
      percent + " % abgeschlossen";
  }

  function validateForm(event) {

    event.preventDefault();

    let firstInvalid = null;

    fields.forEach((field) => {

      if (field.type === "radio") return;

      if (
        !deliverySection.classList.contains(
          "visible"
        )
      ) {

        if (
          [
            "deliveryStreet",
            "deliveryHouseNumber",
            "deliveryPostalCode",
            "deliveryCity"
          ].includes(field.id)
        ) {
          return;
        }
      }

      if (field.id === "username") {
        updateUsernameAvailability();
      }

      if (field.id === "passwordRepeat") {
        validatePasswordRepeat();
      } else {
        markFieldState(field);
      }

      if (
        !firstInvalid &&
        !field.checkValidity()
      ) {
        firstInvalid = field;
      }
    });

    updateProgress();

    if (firstInvalid) {

      firstInvalid.focus();
      form.reportValidity();
      return;
    }

    alert(
      "Formular erfolgreich validiert."
    );
  }

  fields.forEach((field) => {

  if (field.type !== "radio") {

    field.addEventListener("blur", () => {
      markFieldState(field);
      updateProgress();
    });
  }
});

  differentDeliveryRadios.forEach((radio) => {

    radio.addEventListener(
      "change",
      updateConditionalRequired
    );
  });

  postalCode.addEventListener("input", () => {

    autoFillCity(postalCode, city);

    updateProgress();
  });

  deliveryPostalCode.addEventListener(
    "input",
    () => {

      autoFillCity(
        deliveryPostalCode,
        deliveryCity
      );

      updateProgress();
    }
  );

  username.addEventListener(
    "blur",
    updateUsernameAvailability
  );

  username.addEventListener("input", () => {

    username.setCustomValidity("");

    usernameStatus.textContent = "";

    usernameStatus.className =
      "username-status";
  });

  password.addEventListener(
    "input",
    updatePasswordFeedback
  );

  passwordRepeat.addEventListener(
    "input",
    validatePasswordRepeat
  );

  passwordRepeat.addEventListener(
    "blur",
    validatePasswordRepeat
  );

  form.addEventListener(
    "submit",
    validateForm
  );

  cancelButton.addEventListener(
    "click",
    () => {

      if (typeof cancelTest === "function") {

        cancelTest();

      } else {

        if (
          confirm(
            "Möchten Sie den Test wirklich abbrechen?"
          )
        ) {
          window.location.href = "index.html";
        }
      }
    }
  );

  updateConditionalRequired();
  updateProgress();

  if (typeof setupTracking === "function") {
    setupTracking("testForm");
  }

});

//Passwort anzeigen
document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);

    if (!input) return;

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    button.textContent = isHidden ? "🙈" : "👁";
    button.setAttribute(
      "aria-label",
      isHidden ? "Passwort ausblenden" : "Passwort anzeigen"
    );
  });
});