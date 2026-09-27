// Core helpers shared by every room: stage geometry, hotspots, inventory, dialogs, keypad, audio.

export const $ = (sel, root = document) => root.querySelector(sel);

export const stage = $('#stage');
export const layer = $('#layer');
const toastEl = $('#toast');
const modalEl = $('#modal');
const modalCard = $('#modal-card');
const inventoryEl = $('#inventory');
const doorGlow = $('#door-glow');

export const DEBUG = new URLSearchParams(location.search).has('debug');

// ---------- tiny WebAudio synth (no audio files needed) ----------
export const audio = {
  ctx: null,
  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
  },
  tone(freq, dur = 0.08, type = 'sine', gain = 0.08, when = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },
  click() { this.tone(900, 0.05, 'square', 0.03); },
  pickup() { this.tone(660, 0.08, 'triangle'); this.tone(990, 0.12, 'triangle', 0.08, 0.07); },
  error() { this.tone(180, 0.18, 'sawtooth', 0.05); },
  unlock() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.09, i * 0.09)); },
  ding() { this.tone(1200, 0.2, 'sine', 0.06); },
};

export function haptic(pattern = 12) {
  try { navigator.vibrate && navigator.vibrate(pattern); } catch { /* ignore */ }
}

// ---------- DOM helpers ----------
export function el(tag, cls = '', html = '') {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html) n.innerHTML = html;
  return n;
}

/** Position a node inside the stage using percentages of the artwork. */
export function place(node, { x, y, w, h }) {
  node.style.left = x + '%';
  node.style.top = y + '%';
  node.style.width = w + '%';
  node.style.height = h + '%';
  return node;
}

/** Percentage rect -> pixel center inside the stage. */
export function centerOf(r) {
  const b = stage.getBoundingClientRect();
  return { x: b.width * (r.x + r.w / 2) / 100, y: b.height * (r.y + r.h / 2) / 100 };
}

/** Invisible tap target laid over a part of the artwork. */
export function hotspot({ x, y, w, h, circle = false, pulse = false, label = '', onTap }) {
  const n = el('div', 'hotspot' + (circle ? ' circle' : '') + (pulse ? ' pulse' : '') + (DEBUG ? ' debug' : ''));
  place(n, { x, y, w, h });
  if (label) n.setAttribute('aria-label', label);
  n.setAttribute('role', 'button');
  n.addEventListener('click', (e) => { e.stopPropagation(); audio.init(); onTap && onTap(n, e); });
  layer.appendChild(n);
  return n;
}

/** An SVG item drawn on top of the scene (a key on the floor, etc.). */
export function item({ x, y, w, h, icon, cls = '', onTap }) {
  const n = el('div', 'item ' + cls, icon);
  place(n, { x, y, w, h });
  n.addEventListener('click', (e) => { e.stopPropagation(); audio.init(); onTap && onTap(n, e); });
  layer.appendChild(n);
  return n;
}

export function glow({ x, y, w, h }) {
  const g = el('div', 'glow');
  place(g, { x, y, w, h });
  layer.appendChild(g);
  return g;
}

export function clearLayer() { layer.innerHTML = ''; }

// ---------- toast ----------
let toastTimer = 0;
export function toast(msg, ms = 2200) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

// ---------- inventory ----------
export const inventory = {
  items: new Map(),
  selected: null,
  add(id, icon, label = id) {
    this.items.set(id, { icon, label });
    this.selected = id;
    audio.pickup(); haptic([10, 30, 10]);
    this.render(true);
  },
  remove(id) { this.items.delete(id); if (this.selected === id) this.selected = null; this.render(); },
  has(id) { return this.items.has(id); },
  clear() { this.items.clear(); this.selected = null; this.render(); },
  select(id) { this.selected = this.selected === id ? null : id; audio.click(); this.render(); },
  render(pop = false) {
    inventoryEl.innerHTML = '';
    for (const [id, it] of this.items) {
      const slot = el('div', 'inv-slot' + (this.selected === id ? ' selected' : '') + (pop && this.selected === id ? ' pop' : ''), it.icon);
      slot.title = it.label;
      slot.addEventListener('click', () => this.select(id));
      inventoryEl.appendChild(slot);
    }
  },
};

// ---------- modal cards ----------
let onCardClose = null;
export function showCard(html, { closable = true, onClose = null, cls = '' } = {}) {
  modalCard.className = 'modal-card ' + cls;
  modalCard.innerHTML = '';
  if (closable) {
    const x = el('button', 'icon-btn modal-close', '&times;');
    x.setAttribute('aria-label', 'Close');
    x.addEventListener('click', closeCard);
    modalCard.appendChild(x);
  }
  const body = el('div', 'modal-body', html);
  modalCard.appendChild(body);
  onCardClose = onClose;
  modalEl.classList.remove('hidden');
  modalEl.onclick = (e) => { if (e.target === modalEl && closable) closeCard(); };
  return body;
}
export function closeCard() {
  if (modalEl.classList.contains('hidden')) return;
  modalEl.classList.add('hidden');
  modalCard.innerHTML = '';
  const cb = onCardClose; onCardClose = null;
  cb && cb();
}
export function isCardOpen() { return !modalEl.classList.contains('hidden'); }

// ---------- keypad ----------
export function showKeypad({ code, title = 'Keypad', onSolve }) {
  const len = code.length;
  let buf = '';
  const body = showCard(`<h2>${title}</h2><div class="keypad-display" id="kp-display"></div><div class="keypad" id="kp"></div>`);
  const display = $('#kp-display', body);
  const pad = $('#kp', body);
  const render = () => { display.textContent = (buf + '_'.repeat(len - buf.length)).split('').join(''); };
  render();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⏎'];
  for (const k of keys) {
    const b = el('button', '', k);
    b.addEventListener('click', () => {
      audio.init(); audio.click(); haptic(8);
      if (k === 'C') { buf = ''; display.classList.remove('error'); }
      else if (k === '⏎') {
        if (buf === code) {
          display.classList.add('ok'); audio.ding();
          setTimeout(() => { closeCard(); onSolve && onSolve(); }, 450);
        } else {
          display.classList.remove('error'); void display.offsetWidth; display.classList.add('error');
          audio.error(); haptic([40, 40, 40]); buf = '';
          setTimeout(render, 380);
        }
      } else if (buf.length < len) { buf += k; }
      render();
    });
    pad.appendChild(b);
  }
}

// ---------- door glow ----------
export function setDoor(rect) { place(doorGlow, rect); doorGlow.classList.remove('on'); }
export function lightDoor() { doorGlow.classList.add('on'); }

// ---------- motion permissions (iOS 13+) ----------
export async function requestMotion() {
  const DM = window.DeviceMotionEvent, DO = window.DeviceOrientationEvent;
  try {
    if (DO && typeof DO.requestPermission === 'function') await DO.requestPermission();
    if (DM && typeof DM.requestPermission === 'function') await DM.requestPermission();
    return true;
  } catch { return false; }
}

// ---------- icons ----------
const G = '#f3c96b', G2 = '#b8842a';
export const icons = {
  key: `<svg viewBox="0 0 64 64" fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="22" r="11" fill="#2a1d10"/><circle cx="20" cy="22" r="4" fill="${G2}" stroke="none"/><path d="M28 30 L52 54 M44 46 l6 -6 M50 52 l6 -6"/></svg>`,
  lens: `<svg viewBox="0 0 64 64" fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round"><circle cx="26" cy="26" r="16" fill="rgba(180,220,240,.35)"/><path d="M38 38 L56 56" stroke-width="7"/></svg>`,
  screwdriver: `<svg viewBox="0 0 64 64" fill="none" stroke-linecap="round"><path d="M10 54 L30 34" stroke="#9aa5ad" stroke-width="6"/><path d="M28 36 L52 12" stroke="#8b4a1f" stroke-width="12"/><path d="M34 30 L50 14" stroke="${G}" stroke-width="3"/></svg>`,
  note: `<svg viewBox="0 0 64 64"><rect x="10" y="14" width="44" height="36" rx="3" fill="#f4ead2" stroke="${G2}" stroke-width="2"/><path d="M10 16 L32 34 L54 16" fill="none" stroke="${G2}" stroke-width="2"/></svg>`,
};
