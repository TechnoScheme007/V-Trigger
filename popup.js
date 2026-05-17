'use strict';

let words = [];
let matchType = 'contains';

const wordInput      = document.getElementById('wordInput');
const addBtn         = document.getElementById('addBtn');
const chipsContainer = document.getElementById('chipsContainer');
const emptyState     = document.getElementById('emptyState');
const clearBtn       = document.getElementById('clearBtn');
const wordCountEl    = document.getElementById('wordCount');
const hiddenCountEl  = document.getElementById('hiddenCount');
const statusDot      = document.getElementById('statusDot');
const statusText     = document.getElementById('statusText');
const toast          = document.getElementById('toast');

// ─── STORAGE ───────────────────────────────────────────────────
function save() {
  browser.storage.local.set({ words, matchType });
}

function load() {
  browser.storage.local.get(['words', 'matchType'], data => {
    words     = Array.isArray(data.words) ? data.words : [];
    matchType = data.matchType || 'contains';
    applyMatchType();
    renderChips();
    refreshHiddenCount();
  });
}

// ─── RENDER ────────────────────────────────────────────────────
function renderChips() {
  chipsContainer.innerHTML = '';
  wordCountEl.textContent  = words.length;
  clearBtn.disabled        = words.length === 0;

  if (words.length === 0) {
    chipsContainer.appendChild(emptyState);
    return;
  }

  words.forEach((word, idx) => {
    const chip = document.createElement('div');
    chip.className = 'chip';

    const label = document.createElement('span');
    label.textContent = word;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'chip-remove';
    removeBtn.title = `Remove "${word}"`;
    removeBtn.innerHTML = `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    removeBtn.addEventListener('click', () => removeWord(idx));

    chip.appendChild(label);
    chip.appendChild(removeBtn);
    chipsContainer.appendChild(chip);
  });
}

function applyMatchType() {
  const radio = document.querySelector(`input[value="${matchType}"]`);
  if (radio) radio.checked = true;
}

// ─── WORD ACTIONS ──────────────────────────────────────────────
function addWord() {
  const val = wordInput.value.trim();
  if (!val) return;

  const lower = val.toLowerCase();
  if (words.map(w => w.toLowerCase()).includes(lower)) {
    showToast(`"${val}" is already in the list`);
    wordInput.select();
    return;
  }

  words.push(val);
  save();
  renderChips();
  wordInput.value = '';
  wordInput.focus();
  refreshHiddenCount();
  showToast(`"${val}" added`);
}

function removeWord(idx) {
  const removed = words[idx];
  words.splice(idx, 1);
  save();
  renderChips();
  refreshHiddenCount();
  showToast(`"${removed}" removed`);
}

function clearAll() {
  if (words.length === 0) return;
  words = [];
  save();
  renderChips();
  hiddenCountEl.textContent = '—';
  showToast('All words cleared');
}

// ─── MATCH TYPE ────────────────────────────────────────────────
document.querySelectorAll('input[name="matchType"]').forEach(radio => {
  radio.addEventListener('change', () => {
    matchType = radio.value;
    save();
    refreshHiddenCount();
  });
});

// ─── HIDDEN COUNT ──────────────────────────────────────────────
function refreshHiddenCount() {
  browser.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]) return;
    const url = tabs[0].url || '';

    if (!url.includes('facebook.com')) {
      statusDot.classList.add('inactive');
      statusText.textContent = 'Off';
      hiddenCountEl.textContent = '—';
      return;
    }

    statusDot.classList.remove('inactive');
    statusText.textContent = 'Active';

    browser.tabs.sendMessage(tabs[0].id, { type: 'GET_HIDDEN_COUNT' }, response => {
      if (browser.runtime.lastError || !response) {
        hiddenCountEl.textContent = '—';
        return;
      }
      hiddenCountEl.textContent = response.count ?? '—';
    });
  });
}

// ─── TOAST ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ─── EVENT LISTENERS ───────────────────────────────────────────
addBtn.addEventListener('click', addWord);

wordInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addWord();
});

clearBtn.addEventListener('click', clearAll);

// ─── INIT ──────────────────────────────────────────────────────
load();
