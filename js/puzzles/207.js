// Room 207 – The Scale. Balance the sealed box with weights from the shelf.
export default function mount(ctx) {
  const { hotspot, showCard, closeCard, toast, solve, $, el, audio, haptic } = ctx;
  const WEIGHTS = [2, 3, 5, 7, 9];
  const ROMAN = { 2: 'II', 3: 'III', 5: 'V', 7: 'VII', 9: 'IX', 12: 'XII' };
  const TARGET = 12;
  const onPan = new Set();
  let done = false;

  hotspot({ x: 32, y: 40, w: 36, h: 37, label: 'Door', onTap: () => toast('Locked. The mechanism is tied to the scale somehow.') });

  WEIGHTS.forEach((w, i) => hotspot({ x: 3 + i * 4.4, y: 55, w: 4.4, h: 8, label: `Weight ${w}`, onTap: () => toast(`A brass weight stamped ${ROMAN[w]}.`) }));

  hotspot({ x: 72, y: 50, w: 26, h: 24, label: 'Scale', onTap: () => {
    const body = showCard(`<h2>The scale</h2><svg viewBox="0 0 300 200" width="100%" id="scale-svg">
        <g id="beam"><line x1="40" y1="70" x2="260" y2="70" stroke="#d9a441" stroke-width="6" stroke-linecap="round"/>
          <g id="lp"><line x1="40" y1="70" x2="40" y2="120" stroke="#d9a441" stroke-width="2"/><rect x="5" y="120" width="70" height="10" rx="4" fill="#b8842a"/><rect x="18" y="92" width="44" height="28" rx="3" fill="#2a1d10" stroke="#f3c96b" stroke-width="2"/><text x="40" y="111" text-anchor="middle" font-family="Georgia" font-size="14" fill="#f3c96b">XII</text></g>
          <g id="rp"><line x1="260" y1="70" x2="260" y2="120" stroke="#d9a441" stroke-width="2"/><rect x="225" y="120" width="70" height="10" rx="4" fill="#b8842a"/><g id="rw"></g></g>
        </g>
        <path d="M150 70 L135 190 L165 190 Z" fill="#b8842a"/><circle cx="150" cy="70" r="7" fill="#f3c96b"/>
      </svg>
      <div class="weight-row" id="weights"></div><p style="text-align:center;opacity:.8;font-size:13px">Tap weights to place them on the right pan.</p>`);
    const beam = $('#beam', body), row = $('#weights', body), rw = $('#rw', body);
    const render = () => {
      const sum = [...onPan].reduce((a, b) => a + b, 0);
      const tilt = Math.max(-14, Math.min(14, (sum - TARGET) * 2.2));
      beam.setAttribute('transform', `rotate(${tilt} 150 70)`);
      rw.innerHTML = [...onPan].map((w, i) => `<rect x="${230 + i * 13}" y="${106 - w}" width="11" height="${14 + w}" rx="2" fill="#f3c96b" stroke="#000"/>`).join('');
      row.querySelectorAll('.weight').forEach((n) => n.classList.toggle('on', onPan.has(+n.dataset.w)));
      if (!done && sum === TARGET) { done = true; audio.ding(); haptic([20, 40, 80]); setTimeout(() => { closeCard(); solve(); }, 700); }
    };
    WEIGHTS.forEach((w) => {
      const b = el('button', 'weight', ROMAN[w]); b.dataset.w = w;
      b.addEventListener('click', () => { if (done) return; onPan.has(w) ? onPan.delete(w) : onPan.add(w); audio.click(); haptic(6); render(); });
      row.appendChild(b);
    });
    render();
  } });
}
