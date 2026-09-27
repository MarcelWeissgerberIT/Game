// Hand-made rooms on the generated floors: one unique mechanic each.
import { piano, wires as wiresWidget } from '../lib/widgets.js';

const SEG = { // 7-segment layout, digit box 40 x 70
  a: [4, 0, 32, 6], b: [34, 4, 6, 30], c: [34, 36, 6, 30], d: [4, 64, 32, 6], e: [0, 36, 6, 30], f: [0, 4, 6, 30], g: [4, 32, 32, 6],
};
const DIGITS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const rng = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const plate = (ctx, rect, id) => { const p = ctx.el('div', 'plate', String(id)); ctx.place(p, rect); ctx.layer.appendChild(p); };

// 304 – Shadows: slide the lamp until the grille's shadow spells the code.
export function shadows(ctx) {
  const { hotspot, showCard, showKeypad, toast, $, audio } = ctx;
  const CODE = '583', X0 = 62;
  plate(ctx, { x: 42, y: 34, w: 16, h: 5 }, 304);
  hotspot({ x: 33, y: 28, w: 34, h: 47, label: 'Door', onTap: () => toast('Locked.') });
  hotspot({ x: 0, y: 18, w: 15, h: 54, label: 'Grille', onTap: () => toast('A brass lattice. Its shadow on the wall is a mess of lines.') });
  hotspot({ x: 14, y: 36, w: 22, h: 30, label: 'Lamp', onTap: () => {
    const body = showCard(`<h2>The lamp on the rail</h2><input type="range" id="lamp" min="0" max="100" value="12" class="rail"><svg viewBox="0 0 300 150" width="100%" id="wall" style="background:#0b1420;border:4px solid #d9a441;border-radius:6px"></svg><p style="text-align:center;opacity:.8;font-size:13px">Slide the lamp along the rail and watch the wall.</p>`);
    const svg = $('#wall', body), slider = $('#lamp', body);
    const rand = rng(304);
    const segs = [];
    CODE.split('').forEach((d, i) => { for (const s of DIGITS[d]) { const [x, y, w, h] = SEG[s]; segs.push({ x: 50 + i * 75 + x, y: 40 + y, w, h, depth: (rand() * 2 - 1) * 1.6 }); } });
    const draw = () => {
      const v = +slider.value;
      svg.innerHTML = `<rect x="0" y="0" width="300" height="12" fill="#2a1d10"/><circle cx="${v * 3}" cy="6" r="7" fill="#f3c96b"/>` +
        segs.map((s) => `<rect x="${s.x + s.depth * (v - X0) * 2.2}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#1c4a56" opacity=".9"/>`).join('');
    };
    slider.addEventListener('input', () => { draw(); if (Math.abs(+slider.value - X0) < 1) audio.tone(880, 0.08, 'sine', 0.03); });
    draw();
  } });
  hotspot({ x: 66, y: 43, w: 10, h: 12, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 304', onSolve: ctx.solve }) });
}

// 402 – Invisible ink: hold a finger on the letter to warm it; the writing fades again when you let go.
export function ink(ctx) {
  const { hotspot, showCard, showKeypad, toast, $ } = ctx;
  const CODE = '7294';
  plate(ctx, { x: 42, y: 36, w: 16, h: 5 }, 402);
  hotspot({ x: 33, y: 30, w: 34, h: 45, label: 'Door', onTap: () => toast('Locked.') });
  hotspot({ x: 8, y: 54, w: 32, h: 20, label: 'Letter', onTap: () => {
    const body = showCard(`<h2>A blank letter</h2><div class="ink-wrap" id="ink"><div class="ink-text">Dearest M.,<br>the porter has changed the code again.<br>He whispers it to the plants:<br><b>seven, two, nine, four</b>.<br>Burn this.</div><div class="ink-heat" id="heat"><div class="ink-text">Dearest M.,<br>the porter has changed the code again.<br>He whispers it to the plants:<br><b>seven, two, nine, four</b>.<br>Burn this.</div></div></div><p style="text-align:center;opacity:.8;font-size:13px">Hold your finger on the paper. The candle is close.</p>`);
    const wrap = $('#ink', body), heat = $('#heat', body);
    let down = false;
    const at = (e) => { const b = wrap.getBoundingClientRect(); heat.style.clipPath = `circle(${down ? 70 : 0}px at ${e.clientX - b.left}px ${e.clientY - b.top}px)`; };
    wrap.addEventListener('pointerdown', (e) => { down = true; wrap.setPointerCapture(e.pointerId); heat.classList.add('hot'); at(e); });
    wrap.addEventListener('pointermove', (e) => { if (down) at(e); });
    const up = (e) => { down = false; heat.classList.remove('hot'); at(e); };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
  } });
  hotspot({ x: 67, y: 49, w: 10, h: 12, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 402', onSolve: ctx.solve }) });
}

// 503 – Knocks: the pipe taps out groups of knocks; count them.
export function knocks(ctx) {
  const { hotspot, showCard, showKeypad, toast, $, audio } = ctx;
  const GROUPS = [2, 1, 4, 3], CODE = '2143';
  let timers = [], alive = false;
  plate(ctx, { x: 42, y: 36, w: 16, h: 5 }, 503);
  hotspot({ x: 32, y: 30, w: 35, h: 45, label: 'Door', onTap: () => toast('Locked. Somewhere in the walls, water hammers.') });
  hotspot({ x: 78, y: 18, w: 16, h: 58, label: 'Pipe', onTap: () => {
    const body = showCard(`<h2>The pipe</h2><svg viewBox="0 0 120 200" width="40%" style="display:block;margin:0 auto"><rect x="45" y="0" width="30" height="200" fill="#b8842a"/><rect x="40" y="70" width="40" height="14" fill="#8a6a2a"/><circle id="pulse" cx="60" cy="110" r="0" fill="rgba(243,201,107,.6)"/></svg><p style="text-align:center;opacity:.8;font-size:13px">Someone on the other side is knocking. Listen to the groups.</p>`, { onClose: () => stop() });
    const pulse = $('#pulse', body);
    alive = true;
    const knock = () => { audio.init(); audio.tone(95, 0.12, 'sawtooth', 0.12); pulse.setAttribute('r', 40); timers.push(setTimeout(() => pulse.setAttribute('r', 0), 120)); };
    const loop = () => { let t = 600; GROUPS.forEach((n) => { for (let i = 0; i < n; i++) { timers.push(setTimeout(knock, t)); t += 420; } t += 1300; }); timers.push(setTimeout(() => { if (alive) loop(); }, t + 800)); };
    loop();
  } });
  const stop = () => { alive = false; timers.forEach(clearTimeout); timers = []; };
  hotspot({ x: 31, y: 48, w: 10, h: 13, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 503', onSolve: () => { stop(); ctx.solve(); } }) });
  return stop;
}

// 608 – Recipe scale: weigh the loaf with apples, eggs and spoons after working out what each weighs.
export function recipe(ctx) {
  const { hotspot, showCard, closeCard, toast, $, el, audio, haptic } = ctx;
  const ITEMS = [['🍎', 3], ['🥄', 2], ['🥄', 2], ['🥚', 1], ['🥚', 1], ['🥚', 1], ['🥚', 1], ['🥚', 1]];
  const TARGET = 8; // a loaf is two apples and a spoon
  const onPan = new Set(); let done = false;
  plate(ctx, { x: 42, y: 36, w: 16, h: 5 }, 608);
  hotspot({ x: 33, y: 30, w: 33, h: 45, label: 'Door', onTap: () => toast('Locked. It smells of bread.') });
  hotspot({ x: 76, y: 35, w: 19, h: 18, label: 'Recipe book', onTap: () => showCard(`<h2>The recipe book</h2><div class="note"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.2em">KITCHEN WEIGHTS</p><p style="margin:4px 0">Three eggs balance an apple.</p><p style="margin:4px 0">A spoon outweighs an egg by one egg.</p><p style="margin:4px 0">A loaf is two apples and a spoon.</p></div>`) });
  hotspot({ x: 0, y: 34, w: 33, h: 38, label: 'Scale', onTap: () => {
    const body = showCard(`<h2>The kitchen scale</h2><svg viewBox="0 0 300 200" width="100%">
      <g id="beam"><line x1="40" y1="70" x2="260" y2="70" stroke="#d9a441" stroke-width="6" stroke-linecap="round"/>
        <g><line x1="40" y1="70" x2="40" y2="120" stroke="#d9a441" stroke-width="2"/><rect x="5" y="120" width="70" height="10" rx="4" fill="#b8842a"/><text x="40" y="112" text-anchor="middle" font-size="34">🍞</text></g>
        <g><line x1="260" y1="70" x2="260" y2="120" stroke="#d9a441" stroke-width="2"/><rect x="225" y="120" width="70" height="10" rx="4" fill="#b8842a"/><text id="rw" x="260" y="112" text-anchor="middle" font-size="16"></text></g>
      </g><path d="M150 70 L135 190 L165 190 Z" fill="#b8842a"/><circle cx="150" cy="70" r="7" fill="#f3c96b"/></svg>
      <div class="weight-row" id="items" style="flex-wrap:wrap"></div><p style="text-align:center;opacity:.8;font-size:13px">Tap things from the counter to put them on the right pan.</p>`);
    const beam = $('#beam', body), row = $('#items', body), rw = $('#rw', body);
    const render = () => {
      const sum = [...onPan].reduce((a, i) => a + ITEMS[i][1], 0);
      beam.setAttribute('transform', `rotate(${Math.max(-14, Math.min(14, (sum - TARGET) * 2.5))} 150 70)`);
      rw.textContent = [...onPan].map((i) => ITEMS[i][0]).join('');
      row.querySelectorAll('.weight').forEach((n, i) => n.classList.toggle('on', onPan.has(i)));
      if (!done && sum === TARGET) { done = true; audio.ding(); haptic([20, 40, 80]); setTimeout(() => { closeCard(); ctx.solve(); }, 700); }
    };
    ITEMS.forEach(([g], i) => { const b = el('button', 'weight', g); b.addEventListener('click', () => { if (done) return; onPan.has(i) ? onPan.delete(i) : onPan.add(i); audio.click(); haptic(6); render(); }); row.appendChild(b); });
    render();
  } });
}

// 703 – Star window: pan across the night sky until four constellations line up as digits.
export function stars(ctx) {
  const { hotspot, showCard, showKeypad, toast, $, requestMotion, el } = ctx;
  const CODE = '3162', FIELD = 1500, VIEW = 300, CX = 950;
  let onOrient = null;
  plate(ctx, { x: 42, y: 34, w: 16, h: 5 }, 703);
  hotspot({ x: 33, y: 27, w: 34, h: 48, label: 'Door', onTap: () => toast('Locked.') });
  hotspot({ x: 0, y: 28, w: 19, h: 34, label: 'Porthole', onTap: () => {
    const body = showCard(`<h2>The porthole</h2><svg viewBox="0 0 ${VIEW} 220" width="100%" id="sky" style="background:#050a16;border:6px solid #d9a441;border-radius:50%/40%;touch-action:none"></svg><div id="sky-help" style="text-align:center;opacity:.8;font-size:13px;margin-top:8px">Drag to turn your head. Only one patch of sky means anything.</div>`,
      { onClose: () => { if (onOrient) window.removeEventListener('deviceorientation', onOrient); onOrient = null; } });
    const svg = $('#sky', body); const rand = rng(703);
    const bg = Array.from({ length: 260 }, () => ({ x: rand() * FIELD, y: rand() * 220, r: 0.6 + rand() * 1.6 }));
    const digits = [];
    CODE.split('').forEach((d, i) => { for (const s of DIGITS[d]) { const [x, y, w, h] = SEG[s]; const n = Math.max(2, Math.round((w + h) / 12)); for (let k = 0; k < n; k++) digits.push({ x: CX + i * 60 + x + (w > h ? (w * (k + 0.5)) / n : w / 2), y: 70 + y + (h > w ? (h * (k + 0.5)) / n : h / 2) }); } });
    let off = 200;
    const draw = () => { svg.innerHTML = bg.map((s) => { const x = ((s.x - off) % FIELD + FIELD) % FIELD; return `<circle cx="${x}" cy="${s.y}" r="${s.r}" fill="#dfe9f5"/>`; }).join('') + digits.map((s) => { const x = ((s.x - off) % FIELD + FIELD) % FIELD; return `<circle cx="${x}" cy="${s.y}" r="2.6" fill="#f3c96b"/>`; }).join(''); };
    draw();
    let dragging = false, lastX = 0;
    svg.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', (e) => { if (!dragging) return; const b = svg.getBoundingClientRect(); off = (off - (e.clientX - lastX) * VIEW / b.width + FIELD) % FIELD; lastX = e.clientX; draw(); });
    svg.addEventListener('pointerup', () => { dragging = false; }); svg.addEventListener('pointercancel', () => { dragging = false; });
    if ('ontouchstart' in window) {
      const needs = window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function';
      const arm = () => { onOrient = (e) => { if (e.alpha == null || dragging) return; off = ((e.alpha / 360) * FIELD + 200) % FIELD; draw(); }; window.addEventListener('deviceorientation', onOrient); $('#sky-help', body).textContent = 'Turn around slowly, or drag.'; };
      if (needs) { const b = el('button', 'btn btn-ghost btn-small', 'Use the compass'); b.style.marginTop = '6px'; b.addEventListener('click', async () => { if (await requestMotion()) { arm(); b.remove(); } }); $('#sky-help', body).appendChild(b); } else arm();
    }
  } });
  hotspot({ x: 72, y: 46, w: 11, h: 13, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 703', onSolve: ctx.solve }) });
  return () => { if (onOrient) window.removeEventListener('deviceorientation', onOrient); };
}

// 803 – Spot the difference: two paintings, five differences.
export function spot(ctx) {
  const { hotspot, showCard, closeCard, toast, $, audio, haptic } = ctx;
  const DIFFS = [{ x: 232, y: 44, r: 22 }, { x: 150, y: 96, r: 20 }, { x: 62, y: 30, r: 20 }, { x: 268, y: 88, r: 18 }, { x: 100, y: 132, r: 20 }];
  const found = new Set();
  plate(ctx, { x: 42, y: 35, w: 16, h: 5 }, 803);
  hotspot({ x: 33, y: 33, w: 34, h: 42, label: 'Door', onTap: () => toast('Locked. The paintings seem to watch.') });
  const scene = (alt) => `
    <rect width="300" height="160" fill="#0b1420"/>
    <circle cx="150" cy="60" r="26" fill="#f3c96b"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${150 + Math.cos(a) * 32}" y1="${60 + Math.sin(a) * 32}" x2="${150 + Math.cos(a) * 48}" y2="${60 + Math.sin(a) * 48}" stroke="#d9a441" stroke-width="3"/>`; }).join('')}
    <path d="M0 110 Q 40 100 80 110 T 160 110 T 240 110 T 320 110 L320 160 L0 160Z" fill="#1c4a56"/>
    <path d="M0 130 Q 40 120 80 130 T 160 130 T 240 130 T 320 130" fill="none" stroke="#3fb8c9" stroke-width="3"/>
    ${[40, 90, 232].filter((x, i) => !(alt && i === 2)).map((x) => `<path d="M${x - 12} ${40 + (x % 3) * 6} q 6 -8 12 0 q 6 -8 12 0" fill="none" stroke="#f2e6c8" stroke-width="2.5"/>`).join('')}
    <path d="M120 112 L180 112 L170 126 L130 126 Z" fill="#2a1d10"/><line x1="150" y1="112" x2="150" y2="84" stroke="#f2e6c8" stroke-width="2"/><path d="M150 84 L172 92 L150 100 Z" fill="${alt ? '#3fb8c9' : '#e0524f'}"/>
    ${alt ? '' : '<path d="M62 30 l3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" fill="#f3c96b"/>'}
    <rect x="258" y="70" width="20" height="46" fill="#f2e6c8"/><rect x="255" y="64" width="26" height="8" fill="#e0524f"/><rect x="264" y="76" width="8" height="8" fill="#0b1420"/>${alt ? '<rect x="264" y="88" width="8" height="8" fill="#0b1420"/>' : ''}
    ${alt ? '' : '<path d="M92 132 q 8 -6 16 0 q -8 6 -16 0 z M108 132 l 6 -4 v 8 z" fill="#f3c96b"/>'}`;
  hotspot({ x: 0, y: 18, w: 21, h: 46, label: 'Paintings', onTap: () => {
    const body = showCard(`<h2>Twin paintings</h2><svg viewBox="0 0 300 160" width="100%" style="border:4px solid #d9a441;border-radius:4px">${scene(false)}</svg>
      <svg viewBox="0 0 300 160" width="100%" id="alt" style="border:4px solid #d9a441;border-radius:4px;margin-top:8px;touch-action:manipulation">${scene(true)}<g id="marks"></g></svg>
      <p style="text-align:center;opacity:.8;font-size:13px" id="spot-count">Five things differ. Tap them on the lower painting. Found: ${found.size} of 5.</p>`);
    const alt = $('#alt', body), marks = $('#marks', body), count = $('#spot-count', body);
    const redraw = () => { marks.innerHTML = [...found].map((i) => `<circle cx="${DIFFS[i].x}" cy="${DIFFS[i].y}" r="${DIFFS[i].r}" fill="none" stroke="#7fd18a" stroke-width="3"/>`).join(''); count.textContent = `Five things differ. Tap them on the lower painting. Found: ${found.size} of 5.`; };
    redraw();
    alt.addEventListener('click', (e) => {
      const b = alt.getBoundingClientRect(); const x = (e.clientX - b.left) * 300 / b.width, y = (e.clientY - b.top) * 160 / b.height;
      const i = DIFFS.findIndex((d) => Math.hypot(d.x - x, d.y - y) < d.r + 6);
      if (i >= 0 && !found.has(i)) { found.add(i); audio.tone(700 + found.size * 80, 0.15, 'triangle'); haptic(8); redraw(); if (found.size === 5) { audio.ding(); setTimeout(() => { closeCard(); ctx.solve(); }, 700); } }
      else if (i < 0) { audio.error(); }
    });
  } });
}

// 904 – Elevator logic: four portraits make a claim each, one of them lies.
export function elevator(ctx) {
  const { hotspot, showCard, closeCard, toast, $, el, audio, haptic } = ctx;
  const ANSWER = 4;
  plate(ctx, { x: 42, y: 33, w: 16, h: 5 }, 904);
  hotspot({ x: 30, y: 45, w: 40, h: 32, label: 'Elevator', onTap: () => toast('The cab waits. It wants a floor.') });
  hotspot({ x: 0, y: 26, w: 23, h: 30, label: 'Portraits', onTap: () => showCard(`<h2>The portraits</h2><div class="note" style="transform:none;text-align:left">
    <p style="margin:4px 0"><b>The porter:</b> "It is an even floor."</p><p style="margin:4px 0"><b>The maid:</b> "It is higher than six."</p><p style="margin:4px 0"><b>The guest:</b> "It is lower than five."</p><p style="margin:4px 0"><b>The cook:</b> "It is a square number."</p>
    <p style="margin:10px 0 0;font-size:12px;text-align:center">Engraved beneath: ONE OF US ALWAYS LIES.</p></div>`) });
  hotspot({ x: 69, y: 41, w: 12, h: 28, label: 'Panel', onTap: () => {
    const body = showCard(`<h2>Floor panel</h2><div class="floor-row" id="floors" style="flex-wrap:wrap"></div><div class="modal-actions"><button class="btn btn-primary btn-small" id="go">Call</button></div>`);
    const row = $('#floors', body); let chosen = 0;
    const btns = Array.from({ length: 10 }, (_, i) => { const b = el('button', 'floor-btn', String(i + 1)); b.addEventListener('click', () => { chosen = i + 1; audio.click(); btns.forEach((x, k) => x.classList.toggle('on', k + 1 === chosen)); }); row.appendChild(b); return b; });
    $('#go', body).addEventListener('click', () => { if (chosen === ANSWER) { audio.ding(); closeCard(); ctx.solve(); } else { audio.error(); haptic([40, 40, 40]); toast('The cab lurches, then settles back.'); } });
  } });
}

// 909 – Echo: the gramophone plays a tune too high; answer it on the lowest keys.
export function echo(ctx) {
  const { hotspot, showCard, toast, $, audio } = ctx;
  const MELODY = ['E', 'G', 'B', 'A', 'F', 'D'];
  const FREQ = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88 };
  let timers = [];
  plate(ctx, { x: 43, y: 27, w: 14, h: 4 }, 909);
  hotspot({ x: 37, y: 24, w: 26, h: 34, label: 'Door', onTap: () => toast('Locked. The gramophone crackles.') });
  hotspot({ x: 4, y: 30, w: 32, h: 30, label: 'Gramophone', onTap: () => {
    const body = showCard(`<h2>The gramophone</h2><p style="text-align:center">It sings the same six notes, far too high.</p><div class="modal-actions"><button class="btn btn-ghost btn-small" id="play">Wind it up</button></div><p style="text-align:center;opacity:.8;font-size:13px">A label on the horn: "Answer me on the lowest keys."</p>`);
    $('#play', body).addEventListener('click', () => { audio.init(); timers.forEach(clearTimeout); timers = []; MELODY.forEach((n, i) => timers.push(setTimeout(() => audio.tone(FREQ[n] * 4, 0.45, 'triangle', 0.08), i * 520))); });
  } });
  hotspot({ x: 4, y: 78, w: 92, h: 13, label: 'Piano', onTap: () => piano(ctx, { melody: MELODY, octave: 1, title: 'The piano' }) });
  return () => timers.forEach(clearTimeout);
}

// 1004 – Darkroom: the lights are out; a torch with a weak battery shows the wall around your finger.
export function darkroom(ctx) {
  const { hotspot, showKeypad, toast, el, place, layer, stage } = ctx;
  const CODE = '5271', BATTERY = 14000;
  plate(ctx, { x: 42, y: 36, w: 16, h: 5 }, 1004);
  hotspot({ x: 32, y: 30, w: 36, h: 45, label: 'Door', onTap: () => toast('Locked.') });
  const glyphs = [['I', '5', 12, 40], ['II', '2', 86, 24], ['III', '7', 20, 70], ['IV', '1', 84, 72]];
  glyphs.forEach(([r, d, x, y]) => { const g = el('div', 'dark-glyph', `<small>${r}</small>${d}`); place(g, { x: x - 6, y: y - 4, w: 12, h: 8 }); layer.appendChild(g); });
  const dark = el('div', 'dark'); layer.appendChild(dark);
  const bar = el('div', 'torch-bar'); const fill = el('div', 'torch-fill'); bar.appendChild(fill); layer.appendChild(bar);
  let lit = false, used = 0, last = 0, resting = false, raf = 0;
  const light = (e) => { const b = stage.getBoundingClientRect(); dark.style.setProperty('--lx', (e.clientX - b.left) + 'px'); dark.style.setProperty('--ly', (e.clientY - b.top) + 'px'); };
  const tick = (t) => { if (lit && !resting) { used += t - last; if (used >= BATTERY) { resting = true; lit = false; dark.classList.remove('lit'); toast('The torch dies. Give it a moment.'); setTimeout(() => { used = 0; resting = false; }, 3000); } } last = t; fill.style.width = Math.max(0, 100 - (used / BATTERY) * 100) + '%'; raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame((t) => { last = t; tick(t); });
  dark.addEventListener('pointerdown', (e) => { if (resting) return; lit = true; dark.classList.add('lit'); dark.setPointerCapture(e.pointerId); light(e); });
  dark.addEventListener('pointermove', (e) => { if (lit) light(e); });
  const off = () => { lit = false; dark.classList.remove('lit'); };
  dark.addEventListener('pointerup', off); dark.addEventListener('pointercancel', off);
  hotspot({ x: 73, y: 47, w: 12, h: 16, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 1004', onSolve: ctx.solve }) });
  return () => cancelAnimationFrame(raf);
}

// 1008 – Two hands: hold both plates and slide the bolt with a third finger.
export function twoHands(ctx) {
  const { hotspot, showCard, closeCard, toast, $, audio, haptic } = ctx;
  plate(ctx, { x: 42, y: 33, w: 16, h: 5 }, 1008);
  hotspot({ x: 32, y: 22, w: 37, h: 20, label: 'Door', onTap: () => toast('Steel. A bolt as thick as an arm.') });
  hotspot({ x: 6, y: 45, w: 12, h: 13, label: 'Left plate', onTap: () => toast('A brass hand-plate, warm to the touch. It wants to be held.') });
  hotspot({ x: 83, y: 45, w: 12, h: 13, label: 'Right plate', onTap: () => toast('Another hand-plate. Held alone, nothing happens.') });
  hotspot({ x: 38, y: 43, w: 38, h: 20, label: 'Bolt', onTap: () => {
    const body = showCard(`<h2>The bolt</h2><div class="track" id="track"><div class="bolt" id="bolt"></div></div><div class="pads"><div class="pad" id="padL">HOLD</div><div class="pad" id="padR">HOLD</div></div><p style="text-align:center;opacity:.8;font-size:13px" id="hands-help">Both plates must be held while the bolt slides. On a keyboard, hold A and L.</p>`, { onClose: () => window.removeEventListener('keydown', onKey) });
    const track = $('#track', body), bolt = $('#bolt', body), padL = $('#padL', body), padR = $('#padR', body);
    const held = { L: null, R: null }; let dragging = null, x = 0, done = false;
    const both = () => held.L !== null && held.R !== null;
    const setX = (v) => { x = Math.max(0, Math.min(1, v)); bolt.style.left = (x * 100) + '%'; if (!done && x > 0.92) { done = true; audio.ding(); haptic([30, 40, 80]); setTimeout(() => { closeCard(); ctx.solve(); }, 500); } };
    const padDown = (side) => (e) => { held[side] = e.pointerId; e.currentTarget.classList.add('on'); e.currentTarget.setPointerCapture(e.pointerId); audio.tone(200 + (side === 'R' ? 60 : 0), 0.1, 'square', 0.04); };
    const padUp = (side) => (e) => { held[side] = null; e.currentTarget.classList.remove('on'); if (!done) { dragging = null; setX(0); } };
    for (const [pad, side] of [[padL, 'L'], [padR, 'R']]) { pad.addEventListener('pointerdown', padDown(side)); pad.addEventListener('pointerup', padUp(side)); pad.addEventListener('pointercancel', padUp(side)); }
    track.addEventListener('pointerdown', (e) => { if (!both()) { toast('The bolt will not budge. Something is missing.'); return; } dragging = e.pointerId; track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', (e) => { if (dragging !== e.pointerId || !both()) return; const b = track.getBoundingClientRect(); setX((e.clientX - b.left - 24) / (b.width - 48)); });
    const stopDrag = (e) => { if (dragging === e.pointerId) { dragging = null; if (!done) setX(0); } };
    track.addEventListener('pointerup', stopDrag); track.addEventListener('pointercancel', stopDrag);
    const onKey = (e) => { const k = e.key.toLowerCase(); if (k !== 'a' && k !== 'l') return; const side = k === 'a' ? 'L' : 'R', pad = side === 'L' ? padL : padR; if (e.type === 'keydown') { held[side] = 'key'; pad.classList.add('on'); } else { held[side] = null; pad.classList.remove('on'); if (!done) setX(0); } };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    ctx.onCleanup && ctx.onCleanup(() => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); });
  } });
}

export const SPECIAL = { shadows, ink, knocks, recipe, stars, spot, elevator, echo, darkroom, twoHands };
