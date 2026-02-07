(() => {
  const randomUuidInput = document.getElementById("random-uuid-input");
  const newRandomBtn = document.getElementById("new-random-btn");
  const copyRandomBtn = document.getElementById("copy-random-btn");
  const namespaceInput = document.getElementById("namespace-input");
  const addStringBtn = document.getElementById("add-string-btn");
  const generateBtn = document.getElementById("generate-btn");
  const rowsContainer = document.getElementById("string-rows");
  const errorText = document.getElementById("error-text");

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

  function createRow(value = "") {
    const row = document.createElement("div");
    row.className = "uuid5-row";

    const controlsWrap = document.createElement("div");
    controlsWrap.className = "uuid5-row-controls";

    const input = document.createElement("input");
    input.className = "uuid5-value-input";
    input.type = "text";
    input.placeholder = "Enter string value";
    input.value = value;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => row.remove());

    controlsWrap.appendChild(input);
    controlsWrap.appendChild(removeBtn);

    const outputWrap = document.createElement("div");
    outputWrap.className = "uuid5-output-wrap";
    const output = document.createElement("code");
    output.className = "uuid5-output";

    outputWrap.appendChild(output);
    row.appendChild(controlsWrap);
    row.appendChild(outputWrap);

    rowsContainer.appendChild(row);
  }

  addStringBtn.addEventListener("click", () => createRow());
  newRandomBtn.addEventListener("click", () => setRandomUuid());
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

  generateBtn.addEventListener("click", async () => {
    errorText.textContent = "";

    const namespace = namespaceInput.value.trim();
    if (!namespace) {
      errorText.textContent = "Namespace UUID is required.";
      return;
    }

    if (!uuidToBytes(namespace)) {
      errorText.textContent = "Please enter a valid namespace UUID.";
      return;
    }

    const inputs = rowsContainer.querySelectorAll(".uuid5-value-input");
    if (inputs.length === 0) {
      errorText.textContent = "Add at least one string value.";
      return;
    }

    for (const input of inputs) {
      const row = input.closest(".uuid5-row");
      const output = row ? row.querySelector(".uuid5-output") : null;
      const value = input.value;
      if (output) {
        output.textContent = value.length ? await uuidv5(namespace, value) : "";
      }
    }
  });

  setRandomUuid();
  createRow();
})();
