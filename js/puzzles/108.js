// Room 108 – The Switchboard. Lights-out logic: each switch toggles itself and its neighbours.
export default function mount(ctx) {
  const { hotspot, glow, showCard, closeCard, toast, solve, $, audio, haptic, el } = ctx;
  const lamps = [0, 1, 1, 0]; // start state; solution: flip switches 2 and 3
  const xs = [28, 39, 50, 61];
  let done = false;

  hotspot({ x: 30, y: 32, w: 40, h: 45, label: 'Door', onTap: () => toast('The door hums. It wants all four lamps lit.') });

  const glows = xs.map((x) => glow({ x: x - 4, y: 17, w: 19, h: 20 }));
  const paint = () => glows.forEach((g, i) => g.classList.toggle('on', !!lamps[i]));
  paint();

  hotspot({ x: 72, y: 46, w: 9, h: 18, label: 'Switch panel', onTap: () => {
    const body = showCard(`<h2>Switchboard</h2><div class="switch-row" id="lamps"></div><div class="switch-row" id="switches"></div><p style="text-align:center;opacity:.8;font-size:13px">Old wiring. Every switch affects its neighbours.</p>`);
    const lampRow = $('#lamps', body), swRow = $('#switches', body);
    const lampNodes = lamps.map(() => { const l = el('div', 'lamp'); lampRow.appendChild(l); return l; });
    const sync = () => { lampNodes.forEach((n, i) => n.classList.toggle('on', !!lamps[i])); paint(); };
    sync();
    lamps.forEach((_, i) => {
      const t = el('div', 'toggle');
      t.addEventListener('click', () => {
        if (done) return;
        t.classList.toggle('on'); audio.click(); haptic(8);
        [i - 1, i, i + 1].forEach((j) => { if (j >= 0 && j < lamps.length) lamps[j] ^= 1; });
        sync();
        if (lamps.every(Boolean)) { done = true; audio.ding(); setTimeout(() => { closeCard(); solve(); }, 500); }
      });
      swRow.appendChild(t);
    });
  } });
}
