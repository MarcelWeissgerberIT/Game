// Reusable lock widgets for the generated floors. Each returns nothing; they call ctx.solve() when done.
// All of them open inside a modal card, so they work with any room layout.

export function dials(ctx, { combo, steps, legend, title = 'Combination' }) {
  const { showCard, closeCard, $, el, audio, haptic, toast } = ctx;
  const cur = combo.map(() => steps[0]);
  const body = showCard(`<h2>${title}</h2><div class="dial-row" id="dials"></div>
    ${legend ? `<p style="text-align:center;opacity:.8;font-size:13px">Marks engraved around the rim:</p><div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:6px">${legend.map(([g, n]) => `<span style="border:1px solid #d9a441;border-radius:4px;padding:2px 6px;font-size:13px"><span style="color:#f3c96b;font-size:16px">${g}</span> ${n}</span>`).join('')}</div>` : '<p style="text-align:center;opacity:.8;font-size:13px">Tap a dial to turn it.</p>'}
    <div class="modal-actions"><button class="btn btn-primary btn-small" id="turn">Turn handle</button></div>`);
  const row = $('#dials', body);
  const nodes = cur.map((v, i) => {
    const d = el('div', 'dial', String(v));
    d.addEventListener('click', () => { cur[i] = steps[(steps.indexOf(cur[i]) + 1) % steps.length]; d.textContent = cur[i]; audio.click(); haptic(6); });
    row.appendChild(d); return d;
  });
  $('#turn', body).addEventListener('click', () => {
    if (cur.every((v, i) => v === combo[i])) { audio.ding(); closeCard(); ctx.solve(); }
    else { audio.error(); haptic([40, 40, 40]); nodes.forEach((n) => { n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); }); toast('The handle will not move.'); }
  });
}

export function lightsOut(ctx, { lamps, rule, title = 'Switchboard', note = 'Old wiring. Every switch affects its neighbours.' }) {
  const { showCard, closeCard, $, el, audio, haptic } = ctx;
  const state = lamps.slice();
  let done = false;
  const body = showCard(`<h2>${title}</h2><div class="switch-row" id="lamps"></div><div class="switch-row" id="switches"></div><p style="text-align:center;opacity:.8;font-size:13px">${note}</p>`);
  const lampRow = $('#lamps', body), swRow = $('#switches', body);
  const lampNodes = state.map(() => { const l = el('div', 'lamp'); lampRow.appendChild(l); return l; });
  const sync = () => lampNodes.forEach((n, i) => n.classList.toggle('on', !!state[i]));
  sync();
  state.forEach((_, i) => {
    const t = el('div', 'toggle');
    t.addEventListener('click', () => {
      if (done) return;
      t.classList.toggle('on'); audio.click(); haptic(8);
      rule(i).forEach((j) => { if (j >= 0 && j < state.length) state[j] ^= 1; });
      sync();
      if (state.every(Boolean)) { done = true; audio.ding(); setTimeout(() => { closeCard(); ctx.solve(); }, 500); }
    });
    swRow.appendChild(t);
  });
}

export function wires(ctx, { colors, right, title = 'Service panel', hidden = false }) {
  const { showCard, closeCard, $, audio, haptic, toast } = ctx;
  const n = colors.length, S = 300, ys = colors.map((_, i) => 30 + (i * (S - 60)) / (n - 1));
  const connected = colors.map(() => null);
  const body = showCard(`<h2>${title}</h2><svg class="wires" id="wires" viewBox="0 0 ${S} ${S}"></svg><p style="text-align:center;opacity:.8;font-size:13px">${hidden ? 'The colours have faded. Touch a terminal to see it, briefly.' : 'Drag each wire to the terminal of the same colour.'}</p>`);
  const svg = $('#wires', body), NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
  mk('rect', { x: 0, y: 0, width: S, height: S, rx: 10, fill: '#0b1420', stroke: '#d9a441', 'stroke-width': 4 });
  const lines = colors.map((c, i) => mk('line', { x1: 30, y1: ys[i], x2: 30, y2: ys[i], stroke: c, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0 }));
  const dots = colors.map((c, i) => [mk('circle', { cx: 30, cy: ys[i], r: 14, fill: hidden ? '#555' : c, stroke: '#000', 'stroke-width': 3 }), mk('circle', { cx: 270, cy: ys[i], r: 14, fill: hidden ? '#555' : colors[right[i]], stroke: '#000', 'stroke-width': 3 })]);
  const reveal = (i, side) => { if (!hidden) return; const d = dots[i][side]; d.setAttribute('fill', side === 0 ? colors[i] : colors[right[i]]); setTimeout(() => { if (!(side === 0 ? connected[i] !== null : connected.includes(i))) d.setAttribute('fill', '#555'); }, 1200); };
  const drag = mk('rect', { x: 0, y: 0, width: S, height: S, fill: 'transparent' });
  let active = -1;
  const pt = (e) => { const b = svg.getBoundingClientRect(); return { x: (e.clientX - b.left) * S / b.width, y: (e.clientY - b.top) * S / b.height }; };
  drag.addEventListener('pointerdown', (e) => { const p = pt(e); const j = ys.findIndex((y) => Math.hypot(p.x - 270, y - p.y) < 26); if (j >= 0) reveal(j, 1); const i = ys.findIndex((y) => Math.hypot(p.x - 30, y - p.y) < 26); if (i < 0 || connected[i] !== null) return; reveal(i, 0); active = i; drag.setPointerCapture(e.pointerId); lines[i].setAttribute('opacity', 1); lines[i].setAttribute('x2', p.x); lines[i].setAttribute('y2', p.y); });
  drag.addEventListener('pointermove', (e) => { if (active < 0) return; const p = pt(e); lines[active].setAttribute('x2', p.x); lines[active].setAttribute('y2', p.y); });
  const release = (e) => {
    if (active < 0) return; const p = pt(e);
    const j = ys.findIndex((y) => Math.hypot(p.x - 270, y - p.y) < 26);
    if (j >= 0 && right[j] === active && !connected.includes(j)) {
      connected[active] = j; lines[active].setAttribute('x2', 270); lines[active].setAttribute('y2', ys[j]); audio.tone(600 + active * 100, 0.15, 'triangle'); haptic(10); if (hidden) { dots[active][0].setAttribute('fill', colors[active]); dots[j][1].setAttribute('fill', colors[active]); }
      if (connected.every((c) => c !== null)) { audio.ding(); setTimeout(() => { closeCard(); ctx.solve(); }, 500); }
    } else { if (j >= 0) { audio.error(); haptic([40, 40]); toast('Sparks!'); } lines[active].setAttribute('opacity', 0); lines[active].setAttribute('x2', 30); lines[active].setAttribute('y2', ys[active]); }
    active = -1;
  };
  drag.addEventListener('pointerup', release); drag.addEventListener('pointercancel', release);
}

export function scale(ctx, { weights, target, roman, title = 'The scale' }) {
  const { showCard, closeCard, $, el, audio, haptic } = ctx;
  const onPan = new Set(); let done = false;
  const body = showCard(`<h2>${title}</h2><svg viewBox="0 0 300 200" width="100%">
      <g id="beam"><line x1="40" y1="70" x2="260" y2="70" stroke="#d9a441" stroke-width="6" stroke-linecap="round"/>
        <g><line x1="40" y1="70" x2="40" y2="120" stroke="#d9a441" stroke-width="2"/><rect x="5" y="120" width="70" height="10" rx="4" fill="#b8842a"/><rect x="18" y="92" width="44" height="28" rx="3" fill="#2a1d10" stroke="#f3c96b" stroke-width="2"/><text x="40" y="111" text-anchor="middle" font-family="Georgia" font-size="14" fill="#f3c96b">${roman[target]}</text></g>
        <g><line x1="260" y1="70" x2="260" y2="120" stroke="#d9a441" stroke-width="2"/><rect x="225" y="120" width="70" height="10" rx="4" fill="#b8842a"/><g id="rw"></g></g>
      </g><path d="M150 70 L135 190 L165 190 Z" fill="#b8842a"/><circle cx="150" cy="70" r="7" fill="#f3c96b"/></svg>
    <div class="weight-row" id="weights"></div><p style="text-align:center;opacity:.8;font-size:13px">Tap weights to place them on the right pan.</p>`);
  const beam = $('#beam', body), row = $('#weights', body), rw = $('#rw', body);
  const render = () => {
    const sum = [...onPan].reduce((a, b) => a + b, 0);
    beam.setAttribute('transform', `rotate(${Math.max(-14, Math.min(14, (sum - target) * 2))} 150 70)`);
    rw.innerHTML = [...onPan].map((w, i) => `<rect x="${228 + i * 11}" y="${106 - Math.min(w, 12)}" width="9" height="${14 + Math.min(w, 12)}" rx="2" fill="#f3c96b" stroke="#000"/>`).join('');
    row.querySelectorAll('.weight').forEach((n) => n.classList.toggle('on', onPan.has(+n.dataset.w)));
    if (!done && sum === target) { done = true; audio.ding(); haptic([20, 40, 80]); setTimeout(() => { closeCard(); ctx.solve(); }, 700); }
  };
  weights.forEach((w) => { const b = el('button', 'weight', roman[w]); b.dataset.w = w; b.addEventListener('click', () => { if (done) return; onPan.has(w) ? onPan.delete(w) : onPan.add(w); audio.click(); haptic(6); render(); }); row.appendChild(b); });
  render();
}

export function cipherWheel(ctx, { letters, title = 'Cipher wheel' }) {
  const { showCard, $, audio, haptic } = ctx;
  const n = letters.length; let offset = ctx.state.cipherOffset || 0;
  const body = showCard(`<h2>${title}</h2><svg viewBox="0 0 300 300" width="100%" id="wheel"></svg><div class="modal-actions"><button class="btn btn-ghost btn-small" id="ccw">&#8630;</button><button class="btn btn-ghost btn-small" id="cw">&#8631;</button></div>`);
  const svg = $('#wheel', body);
  const draw = () => {
    const ring = (r, items, fill, rot) => items.map((t, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2 + rot; return `<text x="${150 + Math.cos(a) * r}" y="${150 + Math.sin(a) * r + 8}" text-anchor="middle" font-family="Georgia" font-size="${n > 10 ? 18 : 24}" fill="${fill}">${t}</text>`; }).join('');
    svg.innerHTML = `<circle cx="150" cy="150" r="140" fill="#1c1409" stroke="#d9a441" stroke-width="4"/><circle cx="150" cy="150" r="92" fill="#2a1d10" stroke="#d9a441" stroke-width="3"/><path d="M150 4 L142 22 L158 22 Z" fill="#f3c96b"/>${ring(116, letters, '#f3c96b', 0)}${ring(68, [...Array(n).keys()].map((i) => i % 10), '#f2e6c8', (offset / n) * Math.PI * 2)}`;
  };
  draw();
  $('#cw', body).addEventListener('click', () => { offset = (offset + 1) % n; ctx.state.cipherOffset = offset; audio.click(); haptic(6); draw(); });
  $('#ccw', body).addEventListener('click', () => { offset = (offset + n - 1) % n; ctx.state.cipherOffset = offset; audio.click(); haptic(6); draw(); });
}

export function maze(ctx, { cols, rows, seed, title = 'The labyrinth' }) {
  const { showCard, closeCard, $, el, audio, haptic, toast, requestMotion } = ctx;
  function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rand = rng(seed);
  const cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: 1, s: 1, e: 1, w: 1, v: 0 })));
  const stack = [[0, 0]]; cells[0][0].v = 1;
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1]; const opts = [];
    if (cy > 0 && !cells[cy - 1][cx].v) opts.push([cx, cy - 1, 'n', 's']); if (cy < rows - 1 && !cells[cy + 1][cx].v) opts.push([cx, cy + 1, 's', 'n']);
    if (cx > 0 && !cells[cy][cx - 1].v) opts.push([cx - 1, cy, 'w', 'e']); if (cx < cols - 1 && !cells[cy][cx + 1].v) opts.push([cx + 1, cy, 'e', 'w']);
    if (!opts.length) { stack.pop(); continue; }
    const [nx, ny, a, b] = opts[Math.floor(rand() * opts.length)]; cells[cy][cx][a] = 0; cells[ny][nx][b] = 0; cells[ny][nx].v = 1; stack.push([nx, ny]);
  }
  if (ctx.DEBUG) window.__maze = cells;
  const body = showCard(`<h2>${title}</h2><div class="maze-wrap" style="width:min(100%, calc(46dvh * ${cols} / ${rows}));aspect-ratio:${cols} / ${rows}"><canvas id="maze"></canvas></div><div id="tilt-row" style="text-align:center;margin-top:8px"></div>
    <div class="dpad"><span></span><button data-d="u">&#9650;</button><span></span><button data-d="l">&#9664;</button><span></span><button data-d="r">&#9654;</button><span></span><button data-d="d">&#9660;</button><span></span></div>`, { onClose: () => stop() });
  const canvas = $('#maze', body), wrap = $('.maze-wrap', body);
  const dpr = Math.min(window.devicePixelRatio || 1, 2), W = wrap.clientWidth, H = wrap.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr; const g = canvas.getContext('2d'); g.scale(dpr, dpr);
  const cw = W / cols, ch = H / rows, R = 0.28;
  let px = 0.5, py = 0.5, vx = 0, vy = 0, ax = 0, ay = 0, base = null, won = false;
  if (ctx.DEBUG) window.__ball = () => ({ px, py });
  const held = { u: 0, d: 0, l: 0, r: 0 };
  const onOrient = (e) => { if (e.gamma == null || e.beta == null) return; if (base === null) base = e.beta; ax = Math.max(-1, Math.min(1, e.gamma / 25)); ay = Math.max(-1, Math.min(1, (e.beta - base) / 25)); };
  const tiltRow = $('#tilt-row', body);
  const needs = window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function';
  const enableTilt = async () => { if (needs && !(await requestMotion())) { toast('Tilt not allowed. Use the arrows.'); return; } window.addEventListener('deviceorientation', onOrient); tiltRow.innerHTML = '<span style="font-size:12px;opacity:.7">Tilt to roll.</span>'; };
  if (needs) { const b = el('button', 'btn btn-ghost btn-small', 'Enable tilt'); b.addEventListener('click', enableTilt); tiltRow.appendChild(b); }
  else if ('ontouchstart' in window) enableTilt(); else tiltRow.innerHTML = '<span style="font-size:12px;opacity:.7">Arrow keys or buttons.</span>';
  body.querySelectorAll('.dpad button').forEach((b) => { const d = b.dataset.d; const on = (e) => { e.preventDefault(); held[d] = 1; }; const off = () => { held[d] = 0; }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); });
  const keyMap = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' };
  const onKey = (e) => { const d = keyMap[e.key]; if (d) { held[d] = e.type === 'keydown' ? 1 : 0; e.preventDefault(); } };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
  const wallAt = (x, y, side) => x < 0 || y < 0 || x >= cols || y >= rows ? 1 : cells[y][x][side];
  const step = () => {
    vx += (ax + (held.r - held.l) * 0.8) * 0.012; vy += (ay + (held.d - held.u) * 0.8) * 0.012; vx *= 0.9; vy *= 0.9;
    let nx = px + vx; const rr = [Math.floor(py - R + 0.001), Math.floor(py + R - 0.001)], cx = Math.floor(px);
    if (vx > 0 && nx + R > cx + 1 && rr.some((r) => wallAt(cx, r, 'e'))) { nx = cx + 1 - R; vx *= -0.3; }
    if (vx < 0 && nx - R < cx && rr.some((r) => wallAt(cx, r, 'w'))) { nx = cx + R; vx *= -0.3; }
    px = Math.max(R, Math.min(cols - R, nx));
    let ny = py + vy; const cc = [Math.floor(px - R + 0.001), Math.floor(px + R - 0.001)], cy = Math.floor(py);
    if (vy > 0 && ny + R > cy + 1 && cc.some((c) => wallAt(c, cy, 's'))) { ny = cy + 1 - R; vy *= -0.3; }
    if (vy < 0 && ny - R < cy && cc.some((c) => wallAt(c, cy, 'n'))) { ny = cy + R; vy *= -0.3; }
    py = Math.max(R, Math.min(rows - R, ny));
    if (!won && Math.hypot(px - (cols - 0.5), py - (rows - 0.5)) < 0.35) { won = true; audio.ding(); haptic([20, 30, 60]); setTimeout(() => { closeCard(); ctx.solve(); }, 500); }
  };
  const draw = () => {
    g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(243,201,107,.35)'; g.fillRect((cols - 1) * cw, (rows - 1) * ch, cw, ch);
    g.strokeStyle = '#f3c96b'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const c = cells[y][x], X = x * cw, Y = y * ch; if (c.n) { g.moveTo(X, Y); g.lineTo(X + cw, Y); } if (c.w) { g.moveTo(X, Y); g.lineTo(X, Y + ch); } if (c.s) { g.moveTo(X, Y + ch); g.lineTo(X + cw, Y + ch); } if (c.e) { g.moveTo(X + cw, Y); g.lineTo(X + cw, Y + ch); } }
    g.stroke();
    const bx = px * cw, by = py * ch, br = R * Math.min(cw, ch); const grad = g.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.1, bx, by, br); grad.addColorStop(0, '#fff3c4'); grad.addColorStop(1, '#b8842a'); g.fillStyle = grad; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
  };
  let raf = 0; const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); }; loop();
  const stop = () => { cancelAnimationFrame(raf); window.removeEventListener('deviceorientation', onOrient); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
  ctx.onCleanup(stop);
}

export function fog(ctx, { text, mirrored = false, title = 'Fogged glass' }) {
  const { showCard, $, audio } = ctx;
  const body = showCard(`<h2>${title}</h2><div class="wipe-wrap"><div class="wipe-text${mirrored ? ' mirrored' : ''}">${text}</div><canvas id="fog"></canvas></div><p style="text-align:center;opacity:.8;font-size:13px">Wipe the glass with your finger.</p>`);
  const wrap = $('.wipe-wrap', body), canvas = $('#fog', body);
  const dpr = Math.min(window.devicePixelRatio || 1, 2), W = wrap.clientWidth, H = wrap.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr; const g = canvas.getContext('2d'); g.scale(dpr, dpr);
  g.fillStyle = '#c9d5d8'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${200 + Math.random() * 40},${210 + Math.random() * 30},${215 + Math.random() * 30},.35)`; g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 6 + Math.random() * 18, 0, Math.PI * 2); g.fill(); }
  g.globalCompositeOperation = 'destination-out';
  let wiping = false, n = 0;
  const wipe = (e) => { const b = canvas.getBoundingClientRect(); g.beginPath(); g.arc(e.clientX - b.left, e.clientY - b.top, 26, 0, Math.PI * 2); g.fill(); if (++n % 25 === 0) audio.click(); };
  canvas.addEventListener('pointerdown', (e) => { wiping = true; canvas.setPointerCapture(e.pointerId); wipe(e); });
  canvas.addEventListener('pointermove', (e) => { if (wiping) wipe(e); });
  canvas.addEventListener('pointerup', () => { wiping = false; }); canvas.addEventListener('pointercancel', () => { wiping = false; });
}

export function lens(ctx, { items, title = 'Under the glass' }) {
  // items: [{ glyph, digit, x, y }] in percent of the pane
  const { showCard, $ } = ctx;
  const body = showCard(`<h2>${title}</h2><div class="lens-wrap"><div class="lens-base"></div><div class="lens-secret" id="secret" style="display:block">
      ${items.map((it) => `<span style="position:absolute;left:${it.x}%;top:${it.y}%;transform:translate(-50%,-50%)"><small style="font-size:18px">${it.glyph}</small>${it.digit}</span>`).join('')}
    </div><div class="lens-ring" id="ring" style="left:50%;top:50%;opacity:0"></div></div><p style="text-align:center;opacity:.8;font-size:13px">Move the glass over the pattern.</p>`);
  const wrap = $('.lens-wrap', body), secret = $('#secret', body), ring = $('#ring', body);
  const move = (e) => { const b = wrap.getBoundingClientRect(); const x = e.clientX - b.left, y = e.clientY - b.top; secret.style.clipPath = `circle(60px at ${x}px ${y}px)`; ring.style.left = x + 'px'; ring.style.top = y + 'px'; ring.style.opacity = 1; };
  let down = false;
  wrap.addEventListener('pointerdown', (e) => { down = true; wrap.setPointerCapture(e.pointerId); move(e); });
  wrap.addEventListener('pointermove', (e) => { if (down) move(e); });
  wrap.addEventListener('pointerup', () => { down = false; }); wrap.addEventListener('pointercancel', () => { down = false; });
}

export function piano(ctx, { melody, title = 'The piano', octave = null }) {
  const { showCard, closeCard, $, el, audio, haptic } = ctx;
  const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const FREQ = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88 };
  let progress = 0, done = false;
  const body = showCard(`<h2>${title}</h2><div class="piano" id="piano"></div><p style="text-align:center;opacity:.8;font-size:13px">Play what the sheet says.</p>`);
  const wrap = $('#piano', body);
  KEYS.forEach((note, i) => {
    const k = el('div', 'pkey'); k.dataset.note = note + (i < 7 ? 1 : 2);
    k.addEventListener('click', () => {
      if (done) return; audio.init(); audio.tone(FREQ[note] * (i < 7 ? 1 : 2), 0.5, 'triangle', 0.1); haptic(6);
      k.classList.add('down'); setTimeout(() => k.classList.remove('down'), 150);
      const lbl = el('div', 'pkey-label', note); k.appendChild(lbl); setTimeout(() => lbl.remove(), 800);
      const oct = i < 7 ? 1 : 2; const ok = melody[progress] === note && (octave === null || octave === oct);
      if (ok) { progress++; if (progress === melody.length) { done = true; setTimeout(() => { audio.ding(); closeCard(); ctx.solve(); }, 500); } }
      else progress = (note === melody[0] && (octave === null || octave === oct)) ? 1 : 0;
    });
    wrap.appendChild(k);
    if (![2, 6].includes(i % 7)) { const b = el('div', 'pkey black'); wrap.appendChild(b); }
  });
}

export function slide(ctx, { region, image, n = 3, seed = 7, title = 'The picture' }) {
  // region: percent rect of the artwork to cut into tiles; shown inside a card
  const { showCard, closeCard, $, el, audio, haptic } = ctx;
  let tiles = [...Array(n * n).keys()];
  let s = seed; const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const emptyAt = () => tiles.indexOf(n * n - 1);
  const nb = (i) => { const r = Math.floor(i / n), c = i % n, o = []; if (r > 0) o.push(i - n); if (r < n - 1) o.push(i + n); if (c > 0) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; };
  let last = -1;
  for (let k = 0; k < 40 * n; k++) { const e = emptyAt(); const opts = nb(e).filter((x) => x !== last); const p = opts[Math.floor(rand() * opts.length)]; [tiles[e], tiles[p]] = [tiles[p], tiles[e]]; last = e; }
  if (tiles.every((t, i) => t === i)) [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  const body = showCard(`<h2>${title}</h2><div class="slide-card" id="board" style="aspect-ratio:${region.w * 9} / ${region.h * 16}"></div><p style="text-align:center;opacity:.8;font-size:13px">Slide the pieces back into place.</p>`);
  const board = $('#board', body); let solved = false;
  const nodes = [];
  const layout = () => {
    const bw = board.clientWidth, bh = board.clientHeight, tw = bw / n, th = bh / n;
    const imgW = bw / (region.w / 100), imgH = bh / (region.h / 100);
    nodes.forEach((node, i) => {
      const o = tiles[i];
      node.style.width = tw + 'px'; node.style.height = th + 'px'; node.style.left = (i % n) * tw + 'px'; node.style.top = Math.floor(i / n) * th + 'px';
      node.classList.toggle('empty', o === n * n - 1);
      node.style.backgroundSize = `${imgW}px ${imgH}px`;
      node.style.backgroundPosition = `${-(imgW * region.x / 100 + (o % n) * tw)}px ${-(imgH * region.y / 100 + Math.floor(o / n) * th)}px`;
    });
  };
  for (let i = 0; i < n * n; i++) {
    const node = el('div', 'slide-tile'); node.style.backgroundImage = `url(${image})`;
    node.addEventListener('click', () => {
      if (solved) return; const e0 = emptyAt(); if (!nb(i).includes(e0)) return;
      [tiles[i], tiles[e0]] = [tiles[e0], tiles[i]]; audio.click(); haptic(6); layout();
      if (tiles.every((t, k) => t === k)) { solved = true; audio.ding(); setTimeout(() => { closeCard(); ctx.solve(); }, 700); }
    });
    board.appendChild(node); nodes.push(node);
  }
  if (ctx.DEBUG) window.__slide = () => ({ tiles: tiles.slice(), click: (i) => nodes[i].click() });
  layout();
}

export function pattern(ctx, { path, title = 'Pattern lock' }) {
  // path: array of dot indices 0..8 on a 3x3 grid; draw by dragging through the dots
  const { showCard, closeCard, $, audio, haptic, toast } = ctx;
  const S = 300, P = [50, 150, 250];
  const body = showCard(`<h2>${title}</h2><svg viewBox="0 0 ${S} ${S}" class="wires" id="pat"></svg><p style="text-align:center;opacity:.8;font-size:13px">Draw the shape in one stroke.</p>`);
  const svg = $('#pat', body), NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
  mk('rect', { x: 0, y: 0, width: S, height: S, rx: 10, fill: '#0b1420', stroke: '#d9a441', 'stroke-width': 4 });
  const line = mk('polyline', { fill: 'none', stroke: '#f3c96b', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '' });
  const rubber = mk('line', { stroke: '#f3c96b', 'stroke-width': 4, opacity: 0 });
  const dots = [...Array(9).keys()].map((i) => mk('circle', { cx: P[i % 3], cy: P[Math.floor(i / 3)], r: 12, fill: '#2a1d10', stroke: '#d9a441', 'stroke-width': 3 }));
  const drag = mk('rect', { x: 0, y: 0, width: S, height: S, fill: 'transparent' });
  let drawn = [], active = false;
  const pt = (e) => { const b = svg.getBoundingClientRect(); return { x: (e.clientX - b.left) * S / b.width, y: (e.clientY - b.top) * S / b.height }; };
  const hit = (p) => dots.findIndex((d, i) => !drawn.includes(i) && Math.hypot(p.x - P[i % 3], p.y - P[Math.floor(i / 3)]) < 28);
  const add = (i) => { drawn.push(i); dots[i].setAttribute('fill', '#f3c96b'); line.setAttribute('points', drawn.map((k) => `${P[k % 3]},${P[Math.floor(k / 3)]}`).join(' ')); audio.tone(500 + drawn.length * 60, 0.08, 'triangle', 0.05); haptic(6); };
  const reset = () => { drawn = []; dots.forEach((d) => d.setAttribute('fill', '#2a1d10')); line.setAttribute('points', ''); rubber.setAttribute('opacity', 0); };
  drag.addEventListener('pointerdown', (e) => { reset(); active = true; drag.setPointerCapture(e.pointerId); const i = hit(pt(e)); if (i >= 0) add(i); });
  drag.addEventListener('pointermove', (e) => { if (!active) return; const p = pt(e); const i = hit(p); if (i >= 0) add(i); if (drawn.length) { const l = drawn[drawn.length - 1]; rubber.setAttribute('x1', P[l % 3]); rubber.setAttribute('y1', P[Math.floor(l / 3)]); rubber.setAttribute('x2', p.x); rubber.setAttribute('y2', p.y); rubber.setAttribute('opacity', 1); } });
  const up = () => { if (!active) return; active = false; rubber.setAttribute('opacity', 0);
    if (drawn.length === path.length && drawn.every((d, i) => d === path[i])) { audio.ding(); setTimeout(() => { closeCard(); ctx.solve(); }, 500); }
    else if (drawn.length) { audio.error(); toast('The lock rejects the shape.'); setTimeout(reset, 400); } };
  drag.addEventListener('pointerup', up); drag.addEventListener('pointercancel', up);
}

export function morseLamp(ctx, { lamp, code }) {
  // lamp: glow element; blinks the digits of `code` forever until cleaned up
  const MORSE = { 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
  const steps = [];
  for (const ch of code) { for (const s of MORSE[ch]) { steps.push([true, s === '.' ? 220 : 660]); steps.push([false, 220]); } steps[steps.length - 1][1] = 1000; }
  steps[steps.length - 1][1] = 2600;
  let i = 0, t = 0, alive = true;
  const tick = () => { if (!alive) return; const [on, ms] = steps[i]; lamp.classList.toggle('on', on); i = (i + 1) % steps.length; t = setTimeout(tick, ms); };
  tick();
  ctx.onCleanup(() => { alive = false; clearTimeout(t); });
}

export const MORSE_TABLE = { 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
