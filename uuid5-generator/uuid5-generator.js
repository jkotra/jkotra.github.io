(() => {
  const randomUuidInput = document.getElementById("random-uuid-input");
  const newRandomBtn = document.getElementById("new-random-btn");
  const copyRandomBtn = document.getElementById("copy-random-btn");
  const namespaceInput = document.getElementById("namespace-input");
  const addStringBtn = document.getElementById("add-string-btn");
  const lockFieldsBtn = document.getElementById("lock-fields-btn");
  const rowsContainer = document.getElementById("string-rows");
  const errorText = document.getElementById("error-text");
  const generatorContainer = document.getElementById("uuid5-generator");
  const supportsViewTransitions =
    typeof document.startViewTransition === "function";
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let isLocked = false;

  const encoder = new TextEncoder();

  function uuidToBytes(uuid) {
    const hex = uuid.toLowerCase().replace(/-/g, "");
    if (!/^[0-9a-f]{32}$/.test(hex)) return null;

    const out = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }

  function bytesToUuid(bytes) {
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  }

  function randomUuid() {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return bytesToUuid(bytes);
  }

  async function copyText(value) {
    if (!value) return;

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    throw new Error("Clipboard API unavailable.");
  }

  function setRandomUuid() {
    randomUuidInput.value = randomUuid();
  }

  function withViewTransition(updateDOM) {
    if (supportsViewTransitions) {
      document.startViewTransition(updateDOM);
      return;
    }
    updateDOM();
  }

  async function uuidv5(namespaceUuid, value) {
    const namespaceBytes = uuidToBytes(namespaceUuid);
    if (!namespaceBytes) return null;

    const valueBytes = encoder.encode(value);
    const data = new Uint8Array(namespaceBytes.length + valueBytes.length);
    data.set(namespaceBytes, 0);
    data.set(valueBytes, namespaceBytes.length);

    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashBytes = new Uint8Array(hashBuffer).slice(0, 16);

    hashBytes[6] = (hashBytes[6] & 0x0f) | 0x50;
    hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80;

    return bytesToUuid(hashBytes);
  }

  async function updateRowOutput(row) {
    const input = row.querySelector(".uuid5-value-input");
    const output = row.querySelector(".uuid5-output");
    const outputWrap = row.querySelector(".uuid5-output-wrap");
    if (!input || !output || !outputWrap) return;

    const namespace = namespaceInput.value.trim();
    if (!namespace) {
      output.textContent = "";
      outputWrap.hidden = true;
      errorText.textContent = "Namespace UUID is required.";
      return;
    }

    if (!uuidToBytes(namespace)) {
      output.textContent = "";
      outputWrap.hidden = true;
      errorText.textContent = "Please enter a valid namespace UUID.";
      return;
    }

    errorText.textContent = "";
    const value = input.value;
    if (!value.length) {
      output.textContent = "";
      outputWrap.hidden = true;
      return;
    }

    output.textContent = await uuidv5(namespace, value);
    outputWrap.hidden = false;
  }

  async function recomputeAllRows() {
    const rows = rowsContainer.querySelectorAll(".uuid5-row");
    for (const row of rows) {
      await updateRowOutput(row);
    }
  }

  function setLocked(locked) {
    isLocked = locked;
    generatorContainer.classList.toggle("is-locked", locked);
    namespaceInput.readOnly = locked;
    addStringBtn.disabled = locked;

    const inputs = rowsContainer.querySelectorAll(".uuid5-value-input");
    for (const input of inputs) {
      input.readOnly = locked;
    }

    const removeButtons = rowsContainer.querySelectorAll(".uuid5-remove-btn");
    for (const button of removeButtons) {
      button.disabled = locked;
    }

    const icon = lockFieldsBtn.querySelector("i");
    const label = lockFieldsBtn.querySelector("span");
    if (icon) {
      icon.className = locked
        ? "fas fa-solid fa-lock"
        : "fas fa-solid fa-lock-open";
    }
    if (label) {
      label.textContent = locked ? "Locked" : "Lock";
    }
  }

  function createRow(value = "") {
    const row = document.createElement("div");
    row.className = "uuid5-row is-entering";

    const controlsWrap = document.createElement("div");
    controlsWrap.className = "uuid5-row-controls";

    const input = document.createElement("input");
    input.className = "uuid5-value-input";
    input.type = "text";
    input.placeholder = "Enter string value";
    input.value = value;
    input.readOnly = isLocked;
    input.addEventListener("input", () => {
      updateRowOutput(row);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "uuid5-remove-btn";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.disabled = isLocked;
    removeBtn.addEventListener("click", () => {
      if (reducedMotionQuery.matches) {
        withViewTransition(() => row.remove());
        return;
      }

      row.classList.add("is-removing");
      row.addEventListener(
        "animationend",
        () => {
          withViewTransition(() => row.remove());
        },
        { once: true }
      );
    });

    controlsWrap.appendChild(input);
    controlsWrap.appendChild(removeBtn);

    const outputWrap = document.createElement("div");
    outputWrap.className = "uuid5-output-wrap";
    outputWrap.hidden = true;
    const output = document.createElement("code");
    output.className = "uuid5-output";
    const copyFeedback = document.createElement("span");
    copyFeedback.className = "uuid5-copy-feedback";
    copyFeedback.textContent = "Copied";
    copyFeedback.hidden = true;
    const copyOutputBtn = document.createElement("button");
    copyOutputBtn.className = "uuid5-copy-output-btn";
    copyOutputBtn.type = "button";
    copyOutputBtn.title = "Copy UUID";
    copyOutputBtn.innerHTML = '<i class="fas fa-solid fa-copy" aria-hidden="true"></i>';
    copyOutputBtn.addEventListener("click", async () => {
      if (!output.textContent) return;
      try {
        await copyText(output.textContent);
        errorText.textContent = "";
        copyOutputBtn.innerHTML = '<i class="fas fa-solid fa-check" aria-hidden="true"></i>';
        copyFeedback.hidden = false;
        setTimeout(() => {
          copyOutputBtn.innerHTML = '<i class="fas fa-solid fa-copy" aria-hidden="true"></i>';
          copyFeedback.hidden = true;
        }, 900);
      } catch (error) {
        errorText.textContent =
          "Could not copy automatically in this browser/context. Please copy manually.";
      }
    });

    outputWrap.appendChild(output);
    outputWrap.appendChild(copyOutputBtn);
    outputWrap.appendChild(copyFeedback);
    row.appendChild(controlsWrap);
    row.appendChild(outputWrap);

    withViewTransition(() => rowsContainer.appendChild(row));
    if (reducedMotionQuery.matches) {
      row.classList.remove("is-entering");
      return;
    }

    row.addEventListener(
      "animationend",
      () => {
        row.classList.remove("is-entering");
      },
      { once: true }
    );
  }

  addStringBtn.addEventListener("click", () => createRow());
  lockFieldsBtn.addEventListener("click", () => setLocked(!isLocked));
  newRandomBtn.addEventListener("click", () => setRandomUuid());
  namespaceInput.addEventListener("input", () => {
    recomputeAllRows();
  });
  copyRandomBtn.addEventListener("click", async () => {
    try {
      await copyText(randomUuidInput.value);
      errorText.textContent = "";
      copyRandomBtn.textContent = "Copied";
      setTimeout(() => {
        copyRandomBtn.textContent = "Copy";
      }, 1200);
    } catch (error) {
      randomUuidInput.focus();
      randomUuidInput.select();
      errorText.textContent =
        "Could not copy automatically in this browser/context. UUID selected for manual copy.";
    }
  });

  setLocked(false);
  setRandomUuid();
  createRow();
})();
