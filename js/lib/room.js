// Generic room: a layout template (hotspot slots in percent of the artwork) plus a list of objects.
import { CLUES } from './clues.js';
import * as W from './widgets.js';

export const LAYOUTS = {
  A: {
    door: { x: 30, y: 30, w: 40, h: 47 }, plate: { x: 41, y: 37, w: 18, h: 5 },
    keypad: { x: 77, y: 44, w: 16, h: 15 }, sconce: { x: 76, y: 18, w: 22, h: 26 },
    frame: { x: 1, y: 29, w: 24, h: 24 }, note: { x: 41, y: 76, w: 20, h: 11 },
  },
  B: {
    door: { x: 30, y: 30, w: 40, h: 47 }, plate: { x: 41, y: 37, w: 18, h: 5 },
    sconces: [{ x: 25, y: 10, w: 15, h: 26 }, { x: 39.5, y: 10, w: 15, h: 26 }, { x: 54, y: 10, w: 15, h: 26 }, { x: 68.5, y: 10, w: 15, h: 26 }],
    panel: { x: 69, y: 41, w: 15, h: 28 }, shelf: { x: 0, y: 49, w: 26, h: 15 }, note: { x: 41, y: 76, w: 20, h: 11 },
  },
};

const ICONS = (ctx) => ({
  key: ctx.icons.key, lens: ctx.icons.lens, screwdriver: ctx.icons.screwdriver, note: ctx.icons.note,
  fuse: `<svg viewBox="0 0 64 64"><rect x="14" y="20" width="36" height="24" rx="6" fill="#f4ead2" stroke="#b8842a" stroke-width="3"/><rect x="4" y="26" width="10" height="12" fill="#b8842a"/><rect x="50" y="26" width="10" height="12" fill="#b8842a"/><path d="M20 32 L44 32" stroke="#d9534f" stroke-width="3"/></svg>`,
  card: `<svg viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="32" rx="4" fill="#1c4a56" stroke="#f3c96b" stroke-width="3"/><rect x="8" y="24" width="48" height="6" fill="#f3c96b"/></svg>`,
  coin: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#f3c96b" stroke="#b8842a" stroke-width="4"/><circle cx="32" cy="32" r="12" fill="none" stroke="#b8842a" stroke-width="3"/></svg>`,
  candle: `<svg viewBox="0 0 64 64"><rect x="26" y="26" width="12" height="30" fill="#f4ead2" stroke="#b8842a" stroke-width="2"/><ellipse cx="32" cy="18" rx="5" ry="9" fill="#f3c96b"/></svg>`,
});

export function mountRoom(ctx, spec) {
  const L = LAYOUTS[spec.layout];
  const cleanups = [];
  ctx = { ...ctx, state: {}, onCleanup: (fn) => cleanups.push(fn) };
  const { hotspot, glow, showCard, showKeypad, toast, inventory, el, place, layer } = ctx;
  const icons = ICONS(ctx);
  if (ctx.DEBUG) window.__room = spec;

  // room number plate drawn over the blank brass plate
  const plate = el('div', 'plate', String(spec.id));
  place(plate, L.plate); layer.appendChild(plate);

  const doorObj = spec.objects.find((o) => o.at === 'door');
  if (!doorObj) hotspot({ ...L.door, label: 'Door', onTap: () => toast(spec.doorText || 'Locked.') });

  const gate = (o, fn) => (node) => {
    if (o.requires) {
      if (inventory.selected === o.requires) fn(node);
      else if (inventory.has(o.requires)) toast('Select the right item first.');
      else toast(o.flavor || 'Nothing to be done here yet.');
    } else fn(node);
  };

  const sconceGlows = L.sconces ? L.sconces.map((s) => glow({ x: s.x - 2, y: s.y - 2, w: s.w + 4, h: s.h + 4 })) : null;

  for (const o of spec.objects) {
    const slot = L[o.at];
    if (o.item) {
      hotspot({ ...slot, label: o.label || o.at, onTap: gate(o, (n) => { inventory.add(o.item.id, icons[o.item.icon || o.item.id], o.item.label || o.item.id); n.remove(); toast(o.item.text || 'Taken.'); }) });
    } else if (o.clue) {
      const c = o.clue;
      if (c.kind === 'morselamp') { W.morseLamp(ctx, { lamp: glow(L.sconce), code: c.code }); hotspot({ ...L.sconce, label: 'Lamp', onTap: () => toast('The lamp flickers. Short, long, short.') }); continue; }
      if (c.kind === 'fog') { hotspot({ ...slot, label: o.label || o.at, onTap: gate(o, () => W.fog(ctx, c)) }); continue; }
      if (c.kind === 'lens') { hotspot({ ...slot, label: o.label || o.at, onTap: gate(o, () => W.lens(ctx, c)) }); continue; }
      if (c.kind === 'wheel') { hotspot({ ...slot, label: o.label || o.at, onTap: gate(o, () => W.cipherWheel(ctx, c)) }); continue; }
      hotspot({ ...slot, label: o.label || o.at, onTap: gate(o, () => showCard(CLUES[c.kind](c))) });
    } else if (o.lock) {
      const k = o.lock;
      const label = o.label || o.at;
      switch (k.kind) {
        case 'keypad': hotspot({ ...slot, label, onTap: gate(o, () => showKeypad({ code: k.code, title: `Room ${spec.id}`, onSolve: ctx.solve })) }); break;
        case 'keylock': hotspot({ ...slot, label, onTap: () => {
          if (inventory.selected === k.item) { inventory.remove(k.item); ctx.solve(); }
          else if (inventory.has(k.item)) toast('Select the right item first.');
          else toast(o.flavor || 'Locked tight.');
        } }); break;
        case 'dials': hotspot({ ...slot, label, onTap: gate(o, () => W.dials(ctx, k)) }); break;
        case 'lightsout': hotspot({ ...slot, label, onTap: gate(o, () => W.lightsOut(ctx, { lamps: k.lamps, rule: (i) => k.rule === 'pair' ? [i, i + 1] : k.rule === 'skip' ? [i, i + 2, i - 2] : [i - 1, i, i + 1], note: k.note })) }); break;
        case 'wires': hotspot({ ...slot, label, onTap: gate(o, () => W.wires(ctx, k)) }); break;
        case 'scale': hotspot({ ...slot, label, onTap: gate(o, () => W.scale(ctx, k)) }); break;
        case 'maze': hotspot({ ...slot, label, onTap: gate(o, () => W.maze(ctx, k)) }); break;
        case 'piano': hotspot({ ...slot, label, onTap: gate(o, () => W.piano(ctx, k)) }); break;
        case 'slide': hotspot({ ...slot, label, onTap: gate(o, () => W.slide(ctx, { ...k, image: spec.image })) }); break;
        case 'pattern': hotspot({ ...slot, label, onTap: gate(o, () => W.pattern(ctx, k)) }); break;
        case 'sequence': mountSequence(ctx, L, sconceGlows, k); break;
        case 'memory': mountMemory(ctx, L, sconceGlows, k, slot, label, (fn) => gate(o, fn)); break;
        case 'timed': mountTimed(ctx, L, sconceGlows, k, slot, label, (fn) => gate(o, fn)); break;
        default: throw new Error('unknown lock ' + k.kind);
      }
    }
  }
  return () => cleanups.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
}

function mountSequence(ctx, L, glows, k) {
  const { hotspot, toast, audio, haptic } = ctx;
  let progress = 0, done = false;
  L.sconces.forEach((s, i) => hotspot({ ...s, circle: true, label: `Lamp ${i + 1}`, onTap: () => {
    if (done) return;
    if (k.order[progress] === i) { glows[i].classList.add('on'); audio.tone(440 + i * 110, 0.2, 'triangle'); haptic(10); progress++; if (progress === k.order.length) { done = true; setTimeout(ctx.solve, 500); } }
    else { audio.error(); haptic([40, 40, 40]); glows.forEach((g) => g.classList.remove('on')); progress = 0; toast('The lamps flicker and die.'); }
  } }));
}

function mountMemory(ctx, L, glows, k, startSlot, startLabel, gate) {
  const { hotspot, toast, audio, haptic } = ctx;
  const TONES = [392, 494, 587, 698];
  let round = 0, phase = 'idle', progress = 0, timers = [];
  const flash = (i, ms = 380) => { glows[i].classList.add('on'); audio.tone(TONES[i], ms / 1000, 'triangle', 0.08); timers.push(setTimeout(() => glows[i].classList.remove('on'), ms)); };
  const clear = () => { timers.forEach(clearTimeout); timers = []; glows.forEach((g) => g.classList.remove('on')); };
  const play = () => { phase = 'show'; progress = 0; clear(); const len = k.rounds[round]; for (let j = 0; j < len; j++) timers.push(setTimeout(() => flash(k.seq[j]), 600 + j * 620)); timers.push(setTimeout(() => { phase = 'input'; }, 600 + len * 620)); };
  L.sconces.forEach((s, i) => hotspot({ ...s, circle: true, label: `Lamp ${i + 1}`, onTap: () => {
    if (phase !== 'input') return;
    audio.init(); flash(i, 250); haptic(8);
    if (k.seq[progress] === i) { progress++; if (progress === k.rounds[round]) { round++; if (round === k.rounds.length) { phase = 'done'; setTimeout(() => { glows.forEach((g) => g.classList.add('on')); audio.ding(); ctx.solve(); }, 400); } else { phase = 'wait'; toast('Again.', 1000); timers.push(setTimeout(play, 1400)); } } }
    else { phase = 'idle'; round = 0; audio.error(); haptic([60, 40, 60]); toast('The lamps go dark. Start over.'); }
  } }));
  hotspot({ ...startSlot, label: startLabel, onTap: gate(() => { if (['show', 'wait', 'done'].includes(phase)) return; audio.init(); audio.tone(150, 0.2, 'square', 0.05); haptic(20); round = 0; play(); }) });
  ctx.onCleanup(clear);
}

function mountTimed(ctx, L, glows, k, leverSlot, leverLabel, gate) {
  const { hotspot, toast, audio, haptic } = ctx;
  let phase = 'idle', progress = 0, timers = [], deadline = 0, ticker = 0;
  const clear = () => { timers.forEach(clearTimeout); timers = []; clearInterval(ticker); glows.forEach((g) => g.classList.remove('on')); };
  const reset = (msg) => { clear(); phase = 'idle'; progress = 0; audio.error(); haptic([60, 40, 60]); toast(msg); };
  L.sconces.forEach((s, i) => hotspot({ ...s, circle: true, label: `Lamp ${i + 1}`, onTap: () => {
    if (phase !== 'go') return;
    if (k.order[progress] === i) { glows[i].classList.add('on'); audio.tone(500 + progress * 90, 0.15, 'triangle'); haptic(10); progress++; if (progress === k.order.length) { clear(); glows.forEach((g) => g.classList.add('on')); phase = 'done'; setTimeout(ctx.solve, 400); } else { timers.push(setTimeout(() => glows[i].classList.remove('on'), 300)); } }
    else reset('The bolts slam back into place.');
  } }));
  hotspot({ ...leverSlot, label: leverLabel, onTap: gate(() => {
    if (phase !== 'idle') return;
    phase = 'show'; progress = 0; audio.init(); audio.tone(200, 0.3, 'sawtooth', 0.05); haptic(30); toast('Watch.');
    k.order.forEach((idx, j) => { timers.push(setTimeout(() => { glows[idx].classList.add('on'); audio.tone(500 + j * 90, 0.2, 'triangle'); }, 700 + j * 600)); timers.push(setTimeout(() => glows[idx].classList.remove('on'), 700 + j * 600 + 400)); });
    timers.push(setTimeout(() => { phase = 'go'; deadline = Date.now() + k.limit; toast('Now. Quickly.', 1000); ticker = setInterval(() => { const left = deadline - Date.now(); if (left <= 0) reset('Too slow. The lever springs back.'); else if (left < 3000) audio.tone(900, 0.05, 'square', 0.02); }, 500); }, 700 + k.order.length * 600 + 300));
  }) });
  ctx.onCleanup(clear);
}
