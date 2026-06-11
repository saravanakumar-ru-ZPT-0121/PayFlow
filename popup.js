const DEFAULT_SETTINGS = {
  baseUrl: "https://assist.zohobookings.com/#/customer/zohopayments",
  bookedFrom: "PayVKYC",
  extraParams: "",
  darkMode: false,
};

const ticketIdEl = document.getElementById("ticketId");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("status");
const openBtn = document.getElementById("openBtn");
const copyBtn = document.getElementById("copyBtn");
const darkModeEl = document.getElementById("darkMode");
const baseUrlEl = document.getElementById("baseUrl");
const bookedFromEl = document.getElementById("bookedFrom");
const extraParamsEl = document.getElementById("extraParams");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const toggleSettingsBtn = document.getElementById("toggleSettingsBtn");

let builtUrl = "";
let activeTicketId = "";
let settings = { ...DEFAULT_SETTINGS };

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}

function extractTicketIdFromUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);

    // Uses the last numeric segment from the current path.
    const segments = url.pathname.split("/").filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      if (/^\d+$/.test(segments[i])) {
        return segments[i];
      }
    }

    return "";
  } catch {
    return "";
  }
}

function parseExtraParams(rawText) {
  const parsed = {};
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (key) {
      parsed[key] = value;
    }
  }

  return parsed;
}

function applyTheme() {
  document.body.setAttribute("data-theme", settings.darkMode ? "dark" : "light");
}

function buildFinalUrl(ticketId) {
  const baseUrl = (settings.baseUrl || DEFAULT_SETTINGS.baseUrl).trim();
  const bookedFrom = (settings.bookedFrom || DEFAULT_SETTINGS.bookedFrom).trim();
  const params = new URLSearchParams({
    zd_ticket_id: ticketId,
    bookedFrom,
  });

  const extra = parseExtraParams(settings.extraParams || "");
  for (const [key, value] of Object.entries(extra)) {
    if (key !== "zd_ticket_id" && key !== "bookedFrom") {
      params.set(key, value);
    }
  }

  return `${baseUrl}?${params.toString()}`;
}

function loadSettingsForm() {
  baseUrlEl.value = settings.baseUrl;
  bookedFromEl.value = settings.bookedFrom;
  extraParamsEl.value = settings.extraParams;
  darkModeEl.checked = Boolean(settings.darkMode);
  applyTheme();
}

function updateGeneratedUrl() {
  if (!activeTicketId) {
    return;
  }

  builtUrl = buildFinalUrl(activeTicketId);
  outputEl.value = builtUrl;
}

function saveSettings() {
  settings = {
    ...settings,
    baseUrl: baseUrlEl.value.trim() || DEFAULT_SETTINGS.baseUrl,
    bookedFrom: bookedFromEl.value.trim() || DEFAULT_SETTINGS.bookedFrom,
    extraParams: extraParamsEl.value,
    darkMode: darkModeEl.checked,
  };

  chrome.storage.sync.set({ settings }, () => {
    applyTheme();
    updateGeneratedUrl();
    setStatus("Settings saved.", "success");
  });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get("settings");
  settings = {
    ...DEFAULT_SETTINGS,
    ...(stored.settings || {}),
  };
  loadSettingsForm();
}

async function initialize() {
  await loadSettings();

  const tab = await getActiveTab();
  const rawUrl = tab?.url || "";

  const ticketId = extractTicketIdFromUrl(rawUrl);
  activeTicketId = ticketId;

  if (!ticketId) {
    ticketIdEl.textContent = "Not found";
    outputEl.value = "";
    openBtn.disabled = true;
    copyBtn.disabled = true;
    setStatus(
      "No numeric ticket ID found in this tab URL. Open a CRM ticket details page and try again.",
      "error"
    );
    return;
  }

  builtUrl = buildFinalUrl(ticketId);
  ticketIdEl.textContent = ticketId;
  outputEl.value = builtUrl;
  openBtn.disabled = false;
  copyBtn.disabled = false;
  setStatus("URL generated successfully.", "success");
}

toggleSettingsBtn.addEventListener("click", () => {
  const willShow = !settingsPanel.classList.contains("show");
  settingsPanel.classList.toggle("show", willShow);
  toggleSettingsBtn.textContent = willShow ? "Hide" : "Show";
});

saveSettingsBtn.addEventListener("click", saveSettings);

darkModeEl.addEventListener("change", () => {
  settings.darkMode = darkModeEl.checked;
  applyTheme();
});

openBtn.addEventListener("click", () => {
  if (!builtUrl) {
    return;
  }

  chrome.tabs.create({ url: builtUrl });
});

copyBtn.addEventListener("click", async () => {
  if (!builtUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(builtUrl);
    setStatus("Copied to clipboard.", "success");
  } catch {
    setStatus("Could not copy automatically. Select and copy manually.", "error");
  }
});

initialize();