// Room 106 – The Vault. Three dials, combination hidden as roman numerals in the painting.
export default function mount(ctx) {
  const { hotspot, showCard, closeCard, toast, solve, $, audio, haptic, el } = ctx;
  const COMBO = [20, 5, 35];
  const STEPS = [0, 5, 10, 15, 20, 25, 30, 35];
  const dials = [0, 0, 0];

  const LEGEND = [['\u2600', 20], ['\u263E', 35], ['\u2605', 5], ['\u2666', 10], ['\u2660', 25], ['\u269C', 0], ['\u2736', 15], ['\u2756', 30]];
  hotspot({ x: 32, y: 30, w: 38, h: 47, label: 'Door', onTap: () => {
    showCard(`<h2>Engraved on the steel</h2><p style="text-align:center;opacity:.8;font-size:13px">Tiny marks circle the dial.</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0">
        ${LEGEND.map(([g, n]) => `<div style="border:1px solid #d9a441;border-radius:6px;padding:8px 4px;text-align:center"><div style="font-size:26px;color:#f3c96b">${g}</div><div style="font-family:Georgia;font-size:14px">${n}</div></div>`).join('')}
      </div>`);
  } });

  hotspot({ x: 3, y: 37, w: 16, h: 15, label: 'Painting', onTap: () => {
    showCard(`<h2>The painting</h2>
      <svg viewBox="0 0 300 220" width="100%" style="display:block;border:6px solid #d9a441;border-radius:4px;background:#0b1420">
        ${Array.from({ length: 24 }, (_, i) => `<line x1="150" y1="220" x2="${150 + Math.cos(Math.PI + i * Math.PI / 23) * 320}" y2="${220 + Math.sin(Math.PI + i * Math.PI / 23) * 320}" stroke="#d9a441" stroke-opacity=".35" stroke-width="1.5"/>`).join('')}
        <circle cx="150" cy="220" r="70" fill="#1c4a56" stroke="#f3c96b" stroke-width="3"/>
        <text x="60" y="90" fill="#f3c96b" font-size="44" text-anchor="middle">\u2600</text>
        <text x="150" y="50" fill="#f3c96b" font-size="44" text-anchor="middle">\u2605</text>
        <text x="240" y="90" fill="#f3c96b" font-size="44" text-anchor="middle">\u263E</text>
        <text x="60" y="125" fill="#d9a441" font-family="Georgia" font-size="16" text-anchor="middle">I</text>
        <text x="150" y="85" fill="#d9a441" font-family="Georgia" font-size="16" text-anchor="middle">II</text>
        <text x="240" y="125" fill="#d9a441" font-family="Georgia" font-size="16" text-anchor="middle">III</text>
      </svg>`);
  } });

  hotspot({ x: 37, y: 46, w: 26, h: 17, circle: true, label: 'Dial', onTap: () => {
    const body = showCard(`<h2>Combination</h2><div class="dial-row" id="dials"></div><p style="text-align:center;opacity:.8;font-size:13px">Tap a dial to turn it. Tiny marks are engraved around the rim:</p>
      <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:6px">${LEGEND.map(([g, n]) => `<span style="border:1px solid #d9a441;border-radius:4px;padding:2px 6px;font-size:13px"><span style="color:#f3c96b;font-size:16px">${g}</span> ${n}</span>`).join('')}</div>
      <div class="modal-actions"><button class="btn btn-primary btn-small" id="turn">Turn handle</button></div>`);
    const row = $('#dials', body);
    const nodes = dials.map((v, i) => {
      const d = el('div', 'dial', String(v));
      d.addEventListener('click', () => {
        dials[i] = STEPS[(STEPS.indexOf(dials[i]) + 1) % STEPS.length];
        d.textContent = dials[i]; audio.click(); haptic(6);
      });
      row.appendChild(d);
      return d;
    });
    $('#turn', body).addEventListener('click', () => {
      if (dials.every((v, i) => v === COMBO[i])) { audio.ding(); closeCard(); solve(); }
      else { audio.error(); haptic([40, 40, 40]); nodes.forEach((n) => { n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); }); toast('The handle will not move.'); }
    });
  } });
}
