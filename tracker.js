// Erstellung einer Test-ID mit Zeitstempel
function generateTestId() {
  const now = new Date();
  return `test_${now.toISOString().replace(/[:.]/g, "-")}`;
}

// Aktuellen Test vom Browser-Speicher laden
function getCurrentTest() {
  const raw = sessionStorage.getItem("currentTest");
  return raw ? JSON.parse(raw) : null;
}

// Speichert den aktuellen Test im Browser-Speicher
function saveCurrentTest(testData) {
  sessionStorage.setItem("currentTest", JSON.stringify(testData));
}

// Prüft, ob ein Feld ein Passwortfeld ist
function isPasswordField(field) {
  return field.type === "password";
}

// Personenbezogene Daten
function isSensitiveField(field) {
  const sensitiveFields = [
    "fullName",
    "birthDate",
    "email",
    "street",
    "houseNumber",
    "postalCode",
    "city",
    "phone"
  ];

  return sensitiveFields.includes(field.name);
}

// Test-Startfunktion
function startTest(variant) {
  const participantInput = document.getElementById("participantName");
  const participantId = participantInput ? participantInput.value.trim() : "";
  if (!participantId) {
    alert("Bitte Teilnehmernummer eingeben.");
    return;
  }
  const testData = {
    participant_id: participantId,
    test_id: generateTestId(),
    variant: variant,
    status: "gestartet",
    start_time: new Date().toISOString(),
    end_time: null,
    duration_seconds: null,

    metrics: {
      focus_changes: 0,
      input_events: 0,
      correction_count: 0,
      validation_errors: 0,
      submit_attempts: 0,
      required_fields_empty_on_submit: 0,
      cancel_clicks: 0,
      password_metrics: {}
    },

    field_history: {},
    events: [],
    submitted_data: {
      stored: false,
      reason: "Personenbezogene Eingabedaten werden nicht gespeichert."
    }
  };

  saveCurrentTest(testData);

  if (variant === "variante1") {
    window.location.href = "shop_registration1.html";
  } else {
    window.location.href = "shop_registration2.html";
  }
}

// Erfassen und Abspeichern der Metriken
function setupTracking(formId) {
  const testData = getCurrentTest();

  if (!testData) {
    alert("Kein aktiver Test gefunden. Bitte starte auf der Startseite.");
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById(formId);
  if (!form) return;

  const fields = form.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    const fieldName = field.name || field.id;

    if (isPasswordField(field)) {
      initializePasswordMetric(testData, field);
    }

    field.addEventListener("focus", () => {
      const current = getCurrentTest();
      if (!current) return;

      current.metrics.focus_changes += 1;

      current.events.push({
        type: "focus",
        field: fieldName,
        timestamp: new Date().toISOString()
      });
        saveCurrentTest(current);
      });

    field.addEventListener("input", () => {
      const current = getCurrentTest();
      if (!current) return;

      current.metrics.input_events += 1;

      const action = updateInputMetric(current, field);

      if (isPasswordField(field)) {
        updatePasswordMetric(current, field);
      }

      current.events.push({
        type: "input",
        field: fieldName,
        action: action,
        password_field: isPasswordField(field),
        timestamp: new Date().toISOString()
      });

      saveCurrentTest(current);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const current = getCurrentTest();
    if (!current) return;

    current.metrics.submit_attempts += 1;

    current.events.push({
      type: "submit_attempt",
      timestamp: new Date().toISOString()
    });

    let emptyRequiredFields = 0;

    fields.forEach((field) => {
      const isEmpty =
        field.type === "checkbox" ? !field.checked : !field.value.trim();

      if (field.required && isEmpty) {
        emptyRequiredFields += 1;
      }

      field.addEventListener("blur", () => {
  const current = getCurrentTest();
  if (!current) return;

  const hasValue =
    field.type === "checkbox" ? field.checked : field.value.trim() !== "";

  if (hasValue && !field.checkValidity()) {
    current.metrics.validation_errors += 1;

    current.events.push({
      type: "validation_error",
      trigger: "blur",
      field: fieldName,
      password_field: isPasswordField(field),
      timestamp: new Date().toISOString()
    });

    saveCurrentTest(current);
  }
});
    });

    current.metrics.required_fields_empty_on_submit = emptyRequiredFields;

    if (!form.checkValidity()) {
      saveCurrentTest(current);
      form.reportValidity();
      return;
    }

    const safeSubmittedData = {};

fields.forEach((field) => {
  const name = field.name || field.id;

  if (!name) return;

  if (isSensitiveField(field) || isPasswordField(field)) {
    safeSubmittedData[name] = field.checkValidity();
  } else {
    safeSubmittedData[name] = true;
  }
});

current.submitted_data = safeSubmittedData;

    current.events.push({
      type: "submit_success",
      submitted_data: current.submitted_data,
      timestamp: new Date().toISOString()
    });

    saveCurrentTest(current);
    finishTest("abgeschlossen");
  });

  saveCurrentTest(testData);
}

// Eingaben nur anhand der Längenänderung auswerten
function updateInputMetric(current, field) {
  const name = field.name || field.id;

  const previousLength =
    current.field_history[name]?.length ?? 0;

  const currentLength = field.value.length;

  let action = "typed";

  if (currentLength < previousLength) {
    action = "deleted";
    current.metrics.correction_count += 1;
  } else if (currentLength > previousLength) {
    action = "typed";
  } else {
    action = "changed";
  }

  // Sensible Felder niemals speichern
  if (isSensitiveField(field)) {
    current.field_history[name] = {
      valid: field.checkValidity()
    };
  } else {
    current.field_history[name] = {
      length: currentLength
    };
  }

  return action;
}

// Passwortmetriken initialisieren
function initializePasswordMetric(testData, field) {
  const name = field.name || field.id;

  if (!testData.metrics.password_metrics[name]) {
    testData.metrics.password_metrics[name] = {
      input_events: 0,
      final_length: 0,
      became_valid: false
    };
  }

  testData.field_history[name] = {
    length: field.value.length
  };
}

// Passwortmetriken ohne Speichern des Passworts erfassen
function updatePasswordMetric(current, field) {
  const name = field.name || field.id;

  if (!current.metrics.password_metrics[name]) {
    current.metrics.password_metrics[name] = {
      input_events: 0,
      final_length: 0,
      became_valid: false
    };
  }

  const metric = current.metrics.password_metrics[name];

  metric.input_events += 1;
  metric.final_length = field.value.length;

  if (field.checkValidity() && field.value.length > 0) {
    metric.became_valid = true;
  }
}

// Nutzer bricht Test ab
function cancelTest() {
  const current = getCurrentTest();
  if (!current) return;

  current.metrics.cancel_clicks += 1;

  current.events.push({
    type: "cancel",
    timestamp: new Date().toISOString()
  });

  saveCurrentTest(current);
  finishTest("abgebrochen");
}

// Nutzer beendet Test
function finishTest(status) {
  const current = getCurrentTest();
  if (!current) return;

  const endTime = new Date();
  const startTime = new Date(current.start_time);

  current.status = status;
  current.end_time = endTime.toISOString();
  current.duration_seconds = Math.round((endTime - startTime) / 1000);

  saveCurrentTest(current);
  downloadTestResult(current);

  sessionStorage.removeItem("currentTest");

  alert(`Der Test wurde ${status}. Die Ergebnisdatei wurde heruntergeladen.`);
  window.location.href = "index.html";
}

// Download-Funktion
function downloadTestResult(data) {
  const fileName = `${data.test_id}_${data.variant}_${data.status}.json`;
  const jsonString = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}