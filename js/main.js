import { LEVELS } from './levels.js';
import * as E from './engine.js';

const SAVE_KEY = 'nocturne.progress.v1';
const screens = { title: E.$('#screen-title'), levels: E.$('#screen-levels'), game: E.$('#screen-game') };
const roomImg = E.$('#room-img');
const hudTitle = E.$('#hud-title');
const fade = E.$('#fade');

let progress = load();
let current = -1;
let cleanup = null;
let hintsShown = 0;
let lastHintAt = 0;

function load() {
  try { return Object.assign({ unlocked: 0, done: [] }, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); }
  catch { return { unlocked: 0, done: [] }; }
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch { /* private mode */ } }

function show(name) {
  for (const [k, s] of Object.entries(screens)) s.classList.toggle('hidden', k !== name);
}

// ---------- level select ----------
function renderGrid() {
  const grid = E.$('#level-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const done = progress.done.includes(lv.id);
    const locked = i > progress.unlocked;
    const t = E.el('div', 'door-tile' + (done ? ' done' : '') + (locked ? ' locked' : ''), `<span>${lv.id}</span><small>${locked ? 'locked' : lv.title}</small><span class="knob"></span>`);
    if (!locked) t.addEventListener('click', () => { E.audio.init(); startLevel(i); });
    grid.appendChild(t);
  });
}

// ---------- game ----------
function startLevel(i) {
  if (cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
  E.closeCard();
  current = i;
  const lv = LEVELS[i];
  fade.classList.add('on');
  show('game');
  setTimeout(() => {
    E.clearLayer();
    E.inventory.clear();
    hintsShown = 0; lastHintAt = 0;
    roomImg.src = lv.image;
    roomImg.alt = `Room ${lv.id}`;
    hudTitle.textContent = `Room ${lv.id}`;
    E.setDoor(lv.door);
    const ctx = {
      ...E,
      level: lv,
      solve: () => onSolved(lv, i),
    };
    cleanup = lv.mount(ctx) || null;
    const reveal = () => { fade.classList.remove('on'); if (lv.intro) E.toast(lv.intro, 3200); };
    if (roomImg.complete) reveal(); else roomImg.onload = reveal;
  }, 380);
}

function onSolved(lv, i) {
  E.audio.unlock(); E.haptic([30, 40, 30, 40, 80]);
  E.lightDoor();
  if (!progress.done.includes(lv.id)) progress.done.push(lv.id);
  progress.unlocked = Math.max(progress.unlocked, Math.min(i + 1, LEVELS.length - 1));
  save();
  setTimeout(() => {
    const last = i === LEVELS.length - 1;
    const body = E.showCard(
      last
        ? `<h2>Floor One cleared</h2><div class="end-card"><p>The elevator hums back to life and carries you upward.</p><p>More floors of Hotel Nocturne are under renovation. Check back soon.</p></div><div class="modal-actions"><button class="btn btn-primary btn-small" id="btn-end">Back to lobby</button></div>`
        : `<h2>Room ${lv.id} unlocked</h2><p style="text-align:center">The door swings open onto the next corridor.</p><div class="modal-actions"><button class="btn btn-primary btn-small" id="btn-next">Next room</button></div>`,
      { closable: false }
    );
    const b = E.$('#btn-next', body) || E.$('#btn-end', body);
    b.addEventListener('click', () => {
      E.closeCard();
      if (last) { renderGrid(); show('levels'); } else startLevel(i + 1);
    });
  }, 900);
}

function showHint() {
  const lv = LEVELS[current];
  if (!lv) return;
  const now = Date.now();
  const COOLDOWN = 20000;
  let idx = Math.min(hintsShown, lv.hints.length - 1);
  if (hintsShown > 0 && hintsShown < lv.hints.length && now - lastHintAt < COOLDOWN) {
    idx = hintsShown - 1;
    const wait = Math.ceil((COOLDOWN - (now - lastHintAt)) / 1000);
    E.showCard(`<h2>Concierge</h2><p>${lv.hints[idx]}</p><p style="opacity:.6;font-size:13px;text-align:center">Another hint in ${wait}s.</p>`);
    return;
  }
  E.showCard(`<h2>Concierge</h2><p>${lv.hints[idx]}</p>`);
  if (hintsShown < lv.hints.length) { hintsShown++; lastHintAt = now; }
}

// ---------- wiring ----------
E.$('#btn-play').addEventListener('click', () => { E.audio.init(); startLevel(Math.min(progress.unlocked, LEVELS.length - 1)); });
E.$('#btn-levels').addEventListener('click', () => { E.audio.init(); renderGrid(); show('levels'); });
E.$('#btn-levels-back').addEventListener('click', () => show('title'));
E.$('#btn-reset').addEventListener('click', () => {
  if (confirm('Reset all progress?')) { progress = { unlocked: 0, done: [] }; save(); renderGrid(); }
});
E.$('#btn-menu').addEventListener('click', () => {
  if (cleanup) { try { cleanup(); } catch { /* ignore */ } cleanup = null; }
  E.closeCard(); renderGrid(); show('levels');
});
E.$('#btn-hint').addEventListener('click', () => { E.audio.init(); showHint(); });
E.$('#btn-play').textContent = progress.unlocked > 0 || progress.done.length ? 'Continue' : 'Check in';

// PWA
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
