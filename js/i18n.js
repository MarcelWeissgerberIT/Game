// Tiny translation layer. English is the source language; German strings live in js/lang/de.js.
// t(text, vars) looks the English text up and substitutes {vars}. translateTree() walks DOM text nodes.
import { DE } from './lang/de.js';

const KEY = 'nocturne.lang';
const DICTS = { en: null, de: DE };
export let lang = 'en';
try { const saved = localStorage.getItem(KEY); if (saved && DICTS[saved] !== undefined) lang = saved; } catch { /* ignore */ }
if (lang === 'en') { try { if (!localStorage.getItem(KEY) && /^de/i.test(navigator.language || '')) lang = 'de'; } catch { /* ignore */ } }

export const missing = new Set();
const KNOWN_VALUES = new Set(Object.values(DE));

export function setLang(l) {
  lang = DICTS[l] !== undefined ? l : 'en';
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  document.documentElement.lang = lang;
}

function fill(s, vars) { return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s; }

export function t(text, vars) {
  if (text == null) return text;
  const dict = DICTS[lang];
  if (!dict) return fill(text, vars);
  const key = String(text);
  const hit = dict[key];
  if (hit === undefined) { if (/[A-Za-z]{2,}/.test(key) && !KNOWN_VALUES.has(key)) missing.add(key); return fill(key, vars); }
  return fill(hit, vars);
}

/** Translate every text node under root in place (used for cards, HUD, static UI). */
export function translateTree(root) {
  if (!DICTS[lang]) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const raw = n.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed || !/[A-Za-z]{2,}/.test(trimmed)) continue;
    if (n.parentNode && ['SCRIPT', 'STYLE'].includes(n.parentNode.nodeName)) continue;
    const out = t(trimmed);
    if (out !== trimmed) n.nodeValue = raw.replace(trimmed, out);
  }
  root.querySelectorAll && root.querySelectorAll('[title],[aria-label],[placeholder]').forEach((el) => {
    for (const a of ['title', 'aria-label', 'placeholder']) { const v = el.getAttribute(a); if (v) el.setAttribute(a, t(v)); }
  });
}

document.documentElement.lang = lang;
