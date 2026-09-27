// Room 104 – The Labyrinth. Tilt the phone (or use the arrows) to roll a ball through a maze.
export default function mount(ctx) {
  const { hotspot, showCard, closeCard, toast, solve, $, audio, haptic, requestMotion, el } = ctx;
  const COLS = 7, ROWS = 9;
  let stopLoop = null;

  hotspot({ x: 32, y: 40, w: 38, h: 37, label: 'Door', onTap: () => toast('No handle, no keyhole. The panel beside the door hums.') });

  // Deterministic maze (same every time) via a seeded PRNG + DFS carve.
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function buildMaze() {
    const rand = rng(1040);
    const cells = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ n: 1, s: 1, e: 1, w: 1, v: 0 })));
    const stack = [[0, 0]]; cells[0][0].v = 1;
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const opts = [];
      if (cy > 0 && !cells[cy - 1][cx].v) opts.push([cx, cy - 1, 'n', 's']);
      if (cy < ROWS - 1 && !cells[cy + 1][cx].v) opts.push([cx, cy + 1, 's', 'n']);
      if (cx > 0 && !cells[cy][cx - 1].v) opts.push([cx - 1, cy, 'w', 'e']);
      if (cx < COLS - 1 && !cells[cy][cx + 1].v) opts.push([cx + 1, cy, 'e', 'w']);
      if (!opts.length) { stack.pop(); continue; }
      const [nx, ny, a, b] = opts[Math.floor(rand() * opts.length)];
      cells[cy][cx][a] = 0; cells[ny][nx][b] = 0; cells[ny][nx].v = 1;
      stack.push([nx, ny]);
    }
    return cells;
  }
  const maze = buildMaze();
  if (ctx.DEBUG) window.__maze = maze;

  hotspot({ x: 82, y: 40, w: 18, h: 23, label: 'Panel', onTap: openMaze });

  function openMaze() {
    const body = showCard(
      `<h2>The labyrinth</h2><div class="maze-wrap"><canvas id="maze"></canvas></div>
       <div id="tilt-row" style="text-align:center;margin-top:8px"></div>
       <div class="dpad"><span></span><button data-d="u">&#9650;</button><span></span><button data-d="l">&#9664;</button><span></span><button data-d="r">&#9654;</button><span></span><button data-d="d">&#9660;</button><span></span></div>`,
      { onClose: () => stopLoop && stopLoop() }
    );
    const canvas = $('#maze', body);
    const wrap = $('.maze-wrap', body);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = wrap.clientWidth, H = wrap.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const g = canvas.getContext('2d'); g.scale(dpr, dpr);
    const cw = W / COLS, ch = H / ROWS;
    const R = 0.28; // ball radius in cell units
    let px = 0.5, py = 0.5, vx = 0, vy = 0;
    let ax = 0, ay = 0;           // tilt acceleration
    const held = { u: 0, d: 0, l: 0, r: 0 };
    let base = null, won = false;
    if (ctx.DEBUG) window.__ball = () => ({ px, py });

    // --- input: tilt ---
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return;
      if (base === null) base = e.beta;
      ax = Math.max(-1, Math.min(1, e.gamma / 25));
      ay = Math.max(-1, Math.min(1, (e.beta - base) / 25));
    };
    const tiltRow = $('#tilt-row', body);
    const needsPermission = window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function';
    const enableTilt = async () => {
      if (needsPermission && !(await requestMotion())) { toast('Tilt not allowed. Use the arrows.'); return; }
      window.addEventListener('deviceorientation', onOrient);
      tiltRow.innerHTML = '<span style="font-size:12px;opacity:.7">Tilt to roll. Hold flat to recentre.</span>';
    };
    if (needsPermission) {
      const b = el('button', 'btn btn-ghost btn-small', 'Enable tilt');
      b.addEventListener('click', enableTilt);
      tiltRow.appendChild(b);
    } else if ('ontouchstart' in window) {
      enableTilt();
    } else {
      tiltRow.innerHTML = '<span style="font-size:12px;opacity:.7">Use the arrow keys or buttons.</span>';
    }

    // --- input: dpad + keyboard ---
    body.querySelectorAll('.dpad button').forEach((b) => {
      const d = b.dataset.d;
      const on = (e) => { e.preventDefault(); held[d] = 1; };
      const off = () => { held[d] = 0; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
    const keyMap = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' };
    const onKey = (e) => { const d = keyMap[e.key]; if (d) { held[d] = e.type === 'keydown' ? 1 : 0; e.preventDefault(); } };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

    // --- physics ---
    const wallAt = (cx, cy, side) => cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS ? 1 : maze[cy][cx][side];
    function step() {
      const inputX = ax + (held.r - held.l) * 0.8, inputY = ay + (held.d - held.u) * 0.8;
      vx += inputX * 0.012; vy += inputY * 0.012;
      vx *= 0.9; vy *= 0.9;
      // X move
      let nx = px + vx;
      const rows = [Math.floor(py - R + 0.001), Math.floor(py + R - 0.001)];
      const cx = Math.floor(px);
      if (vx > 0 && nx + R > cx + 1 && rows.some((r) => wallAt(cx, r, 'e'))) { nx = cx + 1 - R; vx *= -0.3; }
      if (vx < 0 && nx - R < cx && rows.some((r) => wallAt(cx, r, 'w'))) { nx = cx + R; vx *= -0.3; }
      px = Math.max(R, Math.min(COLS - R, nx));
      // Y move
      let ny = py + vy;
      const cols = [Math.floor(px - R + 0.001), Math.floor(px + R - 0.001)];
      const cy = Math.floor(py);
      if (vy > 0 && ny + R > cy + 1 && cols.some((c) => wallAt(c, cy, 's'))) { ny = cy + 1 - R; vy *= -0.3; }
      if (vy < 0 && ny - R < cy && cols.some((c) => wallAt(c, cy, 'n'))) { ny = cy + R; vy *= -0.3; }
      py = Math.max(R, Math.min(ROWS - R, ny));
      // win check
      if (!won && Math.hypot(px - (COLS - 0.5), py - (ROWS - 0.5)) < 0.35) {
        won = true; audio.ding(); haptic([20, 30, 60]);
        setTimeout(() => { closeCard(); solve(); }, 500);
      }
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      // exit
      g.fillStyle = 'rgba(243,201,107,.35)';
      g.fillRect((COLS - 1) * cw, (ROWS - 1) * ch, cw, ch);
      g.strokeStyle = '#f3c96b'; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath();
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const c = maze[y][x], X = x * cw, Y = y * ch;
        if (c.n) { g.moveTo(X, Y); g.lineTo(X + cw, Y); }
        if (c.w) { g.moveTo(X, Y); g.lineTo(X, Y + ch); }
        if (c.s) { g.moveTo(X, Y + ch); g.lineTo(X + cw, Y + ch); }
        if (c.e) { g.moveTo(X + cw, Y); g.lineTo(X + cw, Y + ch); }
      }
      g.stroke();
      // ball
      const bx = px * cw, by = py * ch, br = R * Math.min(cw, ch);
      const grad = g.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.1, bx, by, br);
      grad.addColorStop(0, '#fff3c4'); grad.addColorStop(1, '#b8842a');
      g.fillStyle = grad; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
    }
    let raf = 0;
    const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); };
    loop();
    stopLoop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
      stopLoop = null;
    };
  }

  return () => stopLoop && stopLoop();
}
