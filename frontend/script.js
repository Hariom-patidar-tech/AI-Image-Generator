// ============================================
// Darkroom — frontend logic
// Hook your real image model into generateImage()
// ============================================

const els = {
    form: document.getElementById('imageForm'),
    prompt: document.getElementById('prompt'),
    charCount: document.getElementById('charCount'),
    presetRow: document.getElementById('presetRow'),
    ratioRow: document.getElementById('ratioRow'),
    advToggle: document.getElementById('advToggle'),
    advPanel: document.getElementById('advPanel'),
    negativePrompt: document.getElementById('negativePrompt'),
    sizeSlider: document.getElementById('sizeSlider'),
    sizeValue: document.getElementById('sizeValue'),
    seed: document.getElementById('seed'),
    generateBtn: document.getElementById('generateBtn'),
    emptyState: document.getElementById('emptyState'),
    loadingState: document.getElementById('loadingState'),
    loadingText: document.getElementById('loadingText'),
    resultState: document.getElementById('resultState'),
    generatedImage: document.getElementById('generatedImage'),
    trayActions: document.getElementById('trayActions'),
    downloadBtn: document.getElementById('downloadBtn'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    exampleChips: document.getElementById('exampleChips'),
    historyStrip: document.getElementById('historyStrip'),
    historyEmpty: document.getElementById('historyEmpty'),
    clearHistory: document.getElementById('clearHistory'),
    toastContainer: document.getElementById('toastContainer'),
    themeToggle: document.getElementById('themeToggle'),
    themePanel: document.getElementById('themePanel'),
    customBg: document.getElementById('customBg'),
};

const THEME_KEY = 'darkroom_theme';
const CUSTOM_BG_KEY = 'darkroom_custom_bg';

const state = {
    style: 'none',
    ratio: '1:1',
    size: 1024,
    lastPayload: null,
};

const HISTORY_KEY = 'darkroom_history';
let history = loadHistory();

init();

function init() {
    renderHistory();
    updateCharCount();
    updateSizeSlider();
    initTheme();

    els.prompt.addEventListener('input', updateCharCount);

    bindChipGroup(els.presetRow, 'style');
    bindChipGroup(els.ratioRow, 'ratio');

    els.advToggle.addEventListener('click', toggleAdvanced);
    els.sizeSlider.addEventListener('input', updateSizeSlider);

    els.exampleChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.example-chip');
        if (!chip) return;
        els.prompt.value = chip.textContent;
        updateCharCount();
        els.prompt.focus();
    });

    els.themeToggle.addEventListener('click', () => {
        const isOpen = !els.themePanel.hidden;
        els.themePanel.hidden = isOpen;
        els.themeToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    els.themePanel.addEventListener('click', (e) => {
        const swatch = e.target.closest('.theme-swatch');
        if (!swatch || !swatch.dataset.theme) return;
        applyTheme(swatch.dataset.theme);
    });

    els.customBg.addEventListener('input', (e) => {
        applyCustomBg(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-switcher')) {
            els.themePanel.hidden = true;
            els.themeToggle.setAttribute('aria-expanded', 'false');
        }
    });

    els.form.addEventListener('submit', handleSubmit);
    els.downloadBtn.addEventListener('click', handleDownload);
    els.regenerateBtn.addEventListener('click', handleRegenerate);
    els.clearHistory.addEventListener('click', handleClearHistory);
}

// ============================================
// Field helpers
// ============================================

function updateCharCount() {
    const words = els.prompt.value.trim().split(/\s+/).filter(Boolean);
    const count = els.prompt.value.trim() ? words.length : 0;
    els.charCount.textContent = count;
    els.charCount.classList.toggle('near-limit', count > 900);
}

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    const savedCustomBg = localStorage.getItem(CUSTOM_BG_KEY);
    if (savedTheme === 'custom' && savedCustomBg) {
        els.customBg.value = savedCustomBg;
        applyCustomBg(savedCustomBg, false);
    } else {
        applyTheme(savedTheme, false);
    }
}

function applyTheme(theme, persist = true) {
    document.documentElement.style.background = '';
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) localStorage.setItem(THEME_KEY, theme);
    els.themePanel.hidden = true;
    els.themeToggle.setAttribute('aria-expanded', 'false');
}

function applyCustomBg(color, persist = true) {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.setProperty('--bg', color);
    document.body.style.background = color;
    if (persist) {
        localStorage.setItem(THEME_KEY, 'custom');
        localStorage.setItem(CUSTOM_BG_KEY, color);
    }
}

function bindChipGroup(row, stateKey) {
    row.addEventListener('click', (e) => {
        const chip = e.target.closest('.preset-chip');
        if (!chip) return;
        row.querySelectorAll('.preset-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state[stateKey] = chip.dataset.style || chip.dataset.ratio;
    });
}

function toggleAdvanced() {
    const isOpen = els.advToggle.getAttribute('aria-expanded') === 'true';
    els.advToggle.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
        els.advPanel.hidden = false;
        // measure natural height, then animate to it
        const target = els.advPanel.scrollHeight;
        els.advPanel.style.maxHeight = '0px';
        requestAnimationFrame(() => {
            els.advPanel.classList.add('open');
            els.advPanel.style.maxHeight = target + 'px';
        });
        els.advPanel.addEventListener('transitionend', function clear() {
            els.advPanel.style.maxHeight = 'none';
            els.advPanel.removeEventListener('transitionend', clear);
        }, { once: true });
    } else {
        const current = els.advPanel.scrollHeight;
        els.advPanel.style.maxHeight = current + 'px';
        requestAnimationFrame(() => {
            els.advPanel.style.maxHeight = '0px';
            els.advPanel.classList.remove('open');
        });
        els.advPanel.addEventListener('transitionend', function clear() {
            els.advPanel.hidden = true;
            els.advPanel.removeEventListener('transitionend', clear);
        }, { once: true });
    }
}

function updateSizeSlider() {
    const val = Number(els.sizeSlider.value);
    state.size = val;
    els.sizeValue.textContent = `${val} × ${val} px`;
    const pct = ((val - els.sizeSlider.min) / (els.sizeSlider.max - els.sizeSlider.min)) * 100;
    els.sizeSlider.style.setProperty('--fill', `${pct}%`);
}

function dimensionsFor(ratio, baseSize) {
    switch (ratio) {
        case '16:9': return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
        case '9:16': return { width: Math.round(baseSize * 9 / 16), height: baseSize };
        case '4:3':  return { width: baseSize, height: Math.round(baseSize * 3 / 4) };
        default:     return { width: baseSize, height: baseSize };
    }
}

// ============================================
// Generation flow
// ============================================

async function handleSubmit(e) {
    e.preventDefault();
    const prompt = els.prompt.value.trim();
    if (!prompt) return;

    const { width, height } = dimensionsFor(state.ratio, state.size);
    const payload = {
        prompt,
        negativePrompt: els.negativePrompt.value.trim(),
        style: state.style,
        ratio: state.ratio,
        width,
        height,
        seed: els.seed.value ? Number(els.seed.value) : undefined,
    };
    state.lastPayload = payload;

    await runGeneration(payload);
}

async function handleRegenerate() {
    if (!state.lastPayload) return;
    const payload = { ...state.lastPayload, seed: Math.floor(Math.random() * 1_000_000) };
    await runGeneration(payload);
}

async function runGeneration(payload) {
    showLoading();

    try {
        const imageUrl = await generateImage(payload);
        showResult(imageUrl, payload);
        addToHistory(imageUrl, payload);
        showToast('Image developed.', 'success');
    } catch (err) {
        console.error(err);
        showEmpty();
        showToast('Something went wrong while generating. Try again.', 'error');
    }
}

/**
 * Swap this out for your real model backend.
 * Expected contract: POST prompt/settings, get back an image URL (or base64 data URL).
 */
async function generateImage(payload) {
    // If you wire up your own backend at /api/generate, it takes priority automatically.
    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Backend responded ${res.status}`);
        const data = await res.json();
        if (!data.image) throw new Error('No image field in response');
        return data.image;
    } catch (err) {
        // Falls back to Pollinations.ai (free, no API key). nologo=true removes its watermark.
        return await pollinationsGenerate(payload);
    }
}

function pollinationsGenerate(payload) {
    const seed = payload.seed ?? Math.floor(Math.random() * 1_000_000);
    const stylePrefix = payload.style && payload.style !== 'none' ? `${payload.style.replace('-', ' ')} style, ` : '';
    const fullPrompt = `${stylePrefix}${payload.prompt}`;
    const params = new URLSearchParams({
        width: payload.width,
        height: payload.height,
        seed: String(seed),
        nologo: 'true',
        model: 'flux',
    });
    if (payload.negativePrompt) params.set('negative_prompt', payload.negativePrompt);

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?${params.toString()}`;

    // Pollinations generates on request, so we just need to let the image load.
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Image backend failed to respond'));
        img.src = url;
    });
}

// ============================================
// Tray state rendering
// ============================================

function showLoading() {
    els.generateBtn.disabled = true;
    els.generateBtn.classList.add('working');
    els.emptyState.hidden = true;
    els.resultState.hidden = true;
    els.loadingState.hidden = false;
    els.trayActions.hidden = true;
}

function showResult(imageUrl, payload) {
    els.generateBtn.disabled = false;
    els.generateBtn.classList.remove('working');
    els.loadingState.hidden = true;
    els.emptyState.hidden = true;

    els.generatedImage.src = imageUrl;
    els.generatedImage.alt = payload.prompt;
    // restart reveal animation
    els.resultState.hidden = false;
    els.generatedImage.style.animation = 'none';
    void els.generatedImage.offsetWidth;
    els.generatedImage.style.animation = '';

    els.trayActions.hidden = false;
}

function showEmpty() {
    els.generateBtn.disabled = false;
    els.generateBtn.classList.remove('working');
    els.loadingState.hidden = true;
    els.resultState.hidden = true;
    els.emptyState.hidden = false;
    els.trayActions.hidden = true;
}

// ============================================
// Download / history
// ============================================

function handleDownload() {
    const a = document.createElement('a');
    a.href = els.generatedImage.src;
    a.download = `darkroom-${Date.now()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 24)));
}

function addToHistory(imageUrl, payload) {
    history.unshift({ src: imageUrl, prompt: payload.prompt, ts: Date.now() });
    saveHistory();
    renderHistory();
}

function renderHistory() {
    els.historyStrip.innerHTML = '';
    if (history.length === 0) {
        els.historyEmpty.hidden = false;
        els.historyStrip.appendChild(els.historyEmpty);
        return;
    }
    els.historyEmpty.hidden = true;
    history.forEach((item, i) => {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.prompt;
        img.className = 'history-thumb';
        img.style.animationDelay = `${i * 0.03}s`;
        img.title = item.prompt;
        img.addEventListener('click', () => {
            els.generatedImage.src = item.src;
            els.generatedImage.alt = item.prompt;
            showResult(item.src, { prompt: item.prompt });
        });
        els.historyStrip.appendChild(img);
    });
}

function handleClearHistory() {
    history = [];
    saveHistory();
    renderHistory();
    showToast('History cleared.', 'success');
}

// ============================================
// Toasts
// ============================================

function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast${type === 'success' ? ' success' : ''}`;
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}