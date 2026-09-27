// Room 110 – The Elevator. Open the service panel with the screwdriver and reconnect the wires.
export default function mount(ctx) {
  const { hotspot, showCard, closeCard, toast, solve, inventory, icons, $, audio, haptic } = ctx;
  const COLORS = ['#e0524f', '#f3c96b', '#3fb8c9', '#7fd18a'];
  const RIGHT = [2, 0, 3, 1]; // colour index at each right-hand terminal, top to bottom
  let opened = false;

  hotspot({ x: 30, y: 32, w: 40, h: 45, label: 'Elevator', onTap: () => toast('Nothing lights up.') });

  hotspot({ x: 6, y: 76, w: 28, h: 9, label: 'Screwdriver', onTap: (n) => {
    inventory.add('screwdriver', icons.screwdriver, 'Screwdriver'); n.remove(); toast('A flat-head screwdriver.');
  } });

  hotspot({ x: 80, y: 46, w: 14, h: 13, label: 'Service panel', onTap: () => {
    if (!opened) {
      if (inventory.selected === 'screwdriver') { opened = true; inventory.remove('screwdriver'); toast('The cover comes off. Loose wires everywhere.'); openWires(); }
      else if (inventory.has('screwdriver')) toast('Select the screwdriver first.');
      else toast('Screwed shut.');
    } else openWires();
  } });

  const connected = [null, null, null, null]; // left index -> right index

  function openWires() {
    const S = 300, ys = [45, 115, 185, 255];
    const body = showCard(`<h2>Service panel</h2><svg class="wires" id="wires" viewBox="0 0 ${S} ${S}"></svg><p style="text-align:center;opacity:.8;font-size:13px">Drag each wire to the terminal of the same colour.</p>`);
    const svg = $('#wires', body);
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); svg.appendChild(n); return n; };
    mk('rect', { x: 0, y: 0, width: S, height: S, rx: 10, fill: '#0b1420', stroke: '#d9a441', 'stroke-width': 4 });
    const lines = COLORS.map((c, i) => mk('line', { x1: 30, y1: ys[i], x2: 30, y2: ys[i], stroke: c, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0 }));
    COLORS.forEach((c, i) => {
      mk('circle', { cx: 30, cy: ys[i], r: 16, fill: c, stroke: '#000', 'stroke-width': 3 });
      mk('circle', { cx: 270, cy: ys[i], r: 16, fill: COLORS[RIGHT[i]], stroke: '#000', 'stroke-width': 3 });
    });
    const dragLayer = mk('rect', { x: 0, y: 0, width: S, height: S, fill: 'transparent' });
    connected.forEach((r, i) => { if (r !== null) { lines[i].setAttribute('x2', 270); lines[i].setAttribute('y2', ys[r]); lines[i].setAttribute('opacity', 1); } });

    let active = -1;
    const pt = (e) => { const b = svg.getBoundingClientRect(); return { x: (e.clientX - b.left) * S / b.width, y: (e.clientY - b.top) * S / b.height }; };
    dragLayer.addEventListener('pointerdown', (e) => {
      const p = pt(e);
      const i = ys.findIndex((y) => Math.hypot(p.x - 30, y - p.y) < 28);
      if (i < 0 || connected[i] !== null) return;
      active = i; dragLayer.setPointerCapture(e.pointerId);
      lines[i].setAttribute('opacity', 1); lines[i].setAttribute('x2', p.x); lines[i].setAttribute('y2', p.y);
    });
    dragLayer.addEventListener('pointermove', (e) => {
      if (active < 0) return; const p = pt(e);
      lines[active].setAttribute('x2', p.x); lines[active].setAttribute('y2', p.y);
    });
    const release = (e) => {
      if (active < 0) return; const p = pt(e);
      const j = ys.findIndex((y) => Math.hypot(p.x - 270, y - p.y) < 28);
      if (j >= 0 && RIGHT[j] === active && !connected.includes(j)) {
        connected[active] = j; lines[active].setAttribute('x2', 270); lines[active].setAttribute('y2', ys[j]);
        audio.tone(600 + active * 120, 0.15, 'triangle'); haptic(10);
        if (connected.every((c) => c !== null)) { audio.ding(); setTimeout(() => { closeCard(); solve(); }, 500); }
      } else {
        if (j >= 0) { audio.error(); haptic([40, 40]); toast('Sparks! Wrong terminal.'); }
        lines[active].setAttribute('opacity', 0); lines[active].setAttribute('x2', 30); lines[active].setAttribute('y2', ys[active]);
      }
      active = -1;
    };
    dragLayer.addEventListener('pointerup', release);
    dragLayer.addEventListener('pointercancel', release);
  }
}
