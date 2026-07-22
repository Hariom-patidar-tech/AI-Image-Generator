window.addEventListener("error", (e) => {
    showDebugBanner(`Script error: ${e.message} (${e.filename}:${e.lineno})`);
});

function showDebugBanner(message) {
    let banner = document.getElementById("debugBanner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "debugBanner";
        banner.style.cssText =
            "position:fixed;top:0;left:0;right:0;background:#5a1a1a;color:#fff;" +
            "padding:10px 16px;font:12px monospace;z-index:9999;white-space:pre-wrap;" +
            "max-height:40vh;overflow:auto;";
        document.body.prepend(banner);
    }
    banner.textContent = message;
}


const form = document.getElementById("imageForm");
const promptInput = document.getElementById("prompt");
const negativePromptInput = document.getElementById("negativePrompt");
const seedInput = document.getElementById("seed");
const charCount = document.getElementById("charCount");

const presetRow = document.getElementById("presetRow");
const ratioRow = document.getElementById("ratioRow");
const advToggle = document.getElementById("advToggle");
const advPanel = document.getElementById("advPanel");

const generateBtn = document.getElementById("generateBtn");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const loadingText = document.getElementById("loadingText");
const resultState = document.getElementById("resultState");
const generatedImage = document.getElementById("generatedImage");
const trayActions = document.getElementById("trayActions");
const downloadBtn = document.getElementById("downloadBtn");
const regenerateBtn = document.getElementById("regenerateBtn");

const historyStrip = document.getElementById("historyStrip");
const historyEmpty = document.getElementById("historyEmpty");
const clearHistoryBtn = document.getElementById("clearHistory");
const toastContainer = document.getElementById("toastContainer");

let selectedStyle = "none";
let selectedRatio = "1:1";
let lastParams = null;
let lastObjectUrl = null;

const HISTORY_KEY = "darkroom_history";
const MAX_HISTORY = 8;


document.getElementById("exampleChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".example-chip");
    if (!chip) return;
    promptInput.value = chip.textContent;
    promptInput.dispatchEvent(new Event("input"));
    promptInput.focus();
});


promptInput.addEventListener("input", () => {
    charCount.textContent = promptInput.value.length;
});


function wireChipGroup(row, onSelect) {
    row.addEventListener("click", (e) => {
        const chip = e.target.closest(".preset-chip");
        if (!chip) return;
        row.querySelectorAll(".preset-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        onSelect(chip.dataset.style ?? chip.dataset.ratio);
    });
}

wireChipGroup(presetRow, (value) => (selectedStyle = value));
wireChipGroup(ratioRow, (value) => (selectedRatio = value));


advToggle.addEventListener("click", () => {
    const isOpen = advPanel.hidden === false;
    advPanel.hidden = isOpen;
    advToggle.setAttribute("aria-expanded", String(!isOpen));
});


function showToast(message, type = "error") {
    const toast = document.createElement("div");
    toast.className = `toast${type === "success" ? " success" : ""}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}


function setTrayState(state) {
    emptyState.hidden = state !== "empty";
    loadingState.hidden = state !== "loading";
    resultState.hidden = state !== "result";
    trayActions.hidden = state !== "result";
}

const LOADING_MESSAGES = [
    "Developing…",
    "Fixing the image…",
    "Rinsing…",
    "Almost ready…",
];

let loadingInterval = null;

function startLoadingMessages() {
    let i = 0;
    loadingText.textContent = LOADING_MESSAGES[0];
    loadingInterval = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        loadingText.textContent = LOADING_MESSAGES[i];
    }, 1400);
}

function stopLoadingMessages() {
    clearInterval(loadingInterval);
}


async function generate(params) {
    setTrayState("loading");
    startLoadingMessages();
    generateBtn.disabled = true;
    generateBtn.querySelector(".btn-label").textContent = "Developing…";

  
    const formData = new FormData();
    formData.append("prompt", params.prompt);
    formData.append("negative_prompt", params.negativePrompt || "");
    formData.append("style", params.style);
    formData.append("aspect_ratio", params.ratio);
    if (params.seed) formData.append("seed", params.seed);


    const BACKEND_URL =
    (window.location.hostname === "127.0.0.1" ||
     window.location.hostname === "localhost")
        ? "http://127.0.0.1:8000"
        : window.location.origin;

    try {
        const requestInfo = `POST ${BACKEND_URL}/generate (form fields: prompt, negative_prompt, style, aspect_ratio${params.seed ? ", seed" : ""})`;

        const response = await fetch(`${BACKEND_URL}/generate`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const bodyText = await response.text().catch(() => "(couldn't read response body)");
            const debugMessage =
                `Request: ${requestInfo}\n` +
                `Status: ${response.status} ${response.statusText}\n` +
                `Allow header: ${response.headers.get("allow") || "(none)"}\n` +
                `Response body: ${bodyText}`;
            showDebugBanner(debugMessage);
            throw new Error(`Generation failed (${response.status}) — see red banner at top for full details`);
        }

      
        const blob = await response.blob();

        if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
        lastObjectUrl = URL.createObjectURL(blob);
        generatedImage.src = lastObjectUrl;

        setTrayState("result");
        lastParams = params;

        await saveToHistory(blob, params.prompt);
    } catch (error) {
        setTrayState("empty");
        showToast(error.message || "Something went wrong while generating.");
    } finally {
        stopLoadingMessages();
        generateBtn.disabled = false;
        generateBtn.querySelector(".btn-label").textContent = "Develop image";
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const prompt = promptInput.value.trim();
    if (!prompt) {
        showToast("Enter a prompt before generating.");
        return;
    }

    generate({
        prompt,
        negativePrompt: negativePromptInput.value.trim(),
        style: selectedStyle,
        ratio: selectedRatio,
        seed: seedInput.value.trim(),
    });
});

regenerateBtn.addEventListener("click", () => {
    if (lastParams) generate(lastParams);
});

downloadBtn.addEventListener("click", () => {
    if (!lastObjectUrl) return;
    const a = document.createElement("a");
    a.href = lastObjectUrl;
    a.download = `darkroom-${Date.now()}.png`;
    a.click();
});


function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function persistHistory(items) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
        
    }
}

async function saveToHistory(blob, prompt) {
    const dataUrl = await blobToDataUrl(blob);
    const items = loadHistory();
    items.unshift({ dataUrl, prompt, ts: Date.now() });
    const trimmed = items.slice(0, MAX_HISTORY);
    persistHistory(trimmed);
    renderHistory(trimmed);
}

function renderHistory(items) {
    historyStrip.querySelectorAll(".history-thumb").forEach((el) => el.remove());
    historyEmpty.hidden = items.length > 0;

    items.forEach((item) => {
        const img = document.createElement("img");
        img.className = "history-thumb";
        img.src = item.dataUrl;
        img.alt = item.prompt;
        img.title = item.prompt;
        img.addEventListener("click", () => {
            generatedImage.src = item.dataUrl;
            lastObjectUrl = item.dataUrl;
            setTrayState("result");
        });
        historyStrip.appendChild(img);
    });
}

clearHistoryBtn.addEventListener("click", () => {
    persistHistory([]);
    renderHistory([]);
});


setTrayState("empty");
renderHistory(loadHistory());