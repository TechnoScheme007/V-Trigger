'use strict';

const ATTR       = 'data-vtrigger-hidden';
const ATTR_SEEN  = 'data-vtrigger-seen';

let filterWords = [];
let matchType   = 'contains';
let hiddenCount = 0;
let observing   = false;
let observer    = null;

// ─── MATCHING ──────────────────────────────────────────────────
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function postMatchesFilter(text) {
  if (!filterWords.length) return false;
  const lower = text.toLowerCase();
  return filterWords.some(word => {
    if (!word.trim()) return false;
    const w = word.trim().toLowerCase();
    if (matchType === 'exact') {
      return new RegExp(`(?<![a-z0-9])${escapeRegex(w)}(?![a-z0-9])`, 'i').test(lower);
    }
    return lower.includes(w);
  });
}

// ─── POST PROCESSING ───────────────────────────────────────────
function processPost(el) {
  // Only consider top-level feed articles, not nested ones (e.g. shared posts inside)
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

  const text = el.innerText || el.textContent || '';

  if (postMatchesFilter(text)) {
    if (!el.hasAttribute(ATTR)) {
      el.style.cssText = 'display:none!important';
      el.setAttribute(ATTR, '1');
      hiddenCount++;
    }
  } else {
    if (el.hasAttribute(ATTR)) {
      el.style.cssText = '';
      el.removeAttribute(ATTR);
      hiddenCount = Math.max(0, hiddenCount - 1);
    }
  }

  el.setAttribute(ATTR_SEEN, '1');
}

function processAllPosts() {
  // Reset count before full pass
  hiddenCount = 0;
  document.querySelectorAll('div[role="article"]').forEach(el => {
    // Skip comment sections and ads that don't have post-level articles
    processPost(el);
    // Recount accurately
    if (el.hasAttribute(ATTR)) hiddenCount++;
    else hiddenCount = hiddenCount; // already counted above
  });
  // Accurate recount
  hiddenCount = document.querySelectorAll(`[${ATTR}]`).length;
}

function unhideAll() {
  document.querySelectorAll(`[${ATTR}]`).forEach(el => {
    el.style.cssText = '';
    el.removeAttribute(ATTR);
  });
  hiddenCount = 0;
}

// ─── MUTATION OBSERVER ─────────────────────────────────────────
function startObserver() {
  if (observing) return;
  observing = true;

  observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.matches('div[role="article"]')) {
          processPost(node);
        } else {
          node.querySelectorAll('div[role="article"]').forEach(processPost);
        }
      }
    }
    // Sync hidden count
    hiddenCount = document.querySelectorAll(`[${ATTR}]`).length;
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

// ─── STORAGE ───────────────────────────────────────────────────
function loadAndApply() {
  browser.storage.local.get(['words', 'matchType'], data => {
    filterWords = Array.isArray(data.words) ? data.words : [];
    matchType   = data.matchType || 'contains';
    unhideAll();
    processAllPosts();
    startObserver();
  });
}

browser.storage.onChanged.addListener(changes => {
  let changed = false;
  if (changes.words)     { filterWords = changes.words.newValue || [];    changed = true; }
  if (changes.matchType) { matchType   = changes.matchType.newValue || 'contains'; changed = true; }
  if (changed) {
    unhideAll();
    processAllPosts();
  }
});

// ─── MESSAGE LISTENER (for popup count query) ──────────────────
browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_HIDDEN_COUNT') {
    sendResponse({ count: hiddenCount });
  }
  return true;
});

// ─── INIT ──────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAndApply);
} else {
  loadAndApply();
}
