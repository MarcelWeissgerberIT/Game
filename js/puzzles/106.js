// Room 106 – The Vault. Three dials, combination hidden as roman numerals in the painting.
export default function mount(ctx) {
  const { hotspot, showCard, closeCard, toast, solve, $, audio, haptic, el } = ctx;
  const COMBO = [20, 5, 35];
  const STEPS = [0, 5, 10, 15, 20, 25, 30, 35];
  const dials = [0, 0, 0];

  hotspot({ x: 32, y: 30, w: 38, h: 47, label: 'Door', onTap: () => toast('Solid steel. Only the dial will open it.') });

  hotspot({ x: 3, y: 37, w: 16, h: 15, label: 'Painting', onTap: () => {
    showCard(`<h2>The painting</h2>
      <svg viewBox="0 0 300 220" width="100%" style="display:block;border:6px solid #d9a441;border-radius:4px;background:#0b1420">
        ${Array.from({ length: 24 }, (_, i) => `<line x1="150" y1="220" x2="${150 + Math.cos(Math.PI + i * Math.PI / 23) * 320}" y2="${220 + Math.sin(Math.PI + i * Math.PI / 23) * 320}" stroke="#d9a441" stroke-opacity=".35" stroke-width="1.5"/>`).join('')}
        <circle cx="150" cy="220" r="70" fill="#1c4a56" stroke="#f3c96b" stroke-width="3"/>
        <text x="60" y="80" fill="#f3c96b" font-family="Georgia" font-size="34" text-anchor="middle">XX</text>
        <text x="150" y="50" fill="#f3c96b" font-family="Georgia" font-size="34" text-anchor="middle">V</text>
        <text x="240" y="80" fill="#f3c96b" font-family="Georgia" font-size="34" text-anchor="middle">XXXV</text>
        <text x="150" y="200" fill="#f3c96b" font-family="Georgia" font-size="12" text-anchor="middle" letter-spacing="3">LEFT TO RIGHT</text>
      </svg>`);
  } });

  hotspot({ x: 37, y: 46, w: 26, h: 17, circle: true, label: 'Dial', onTap: () => {
    const body = showCard(`<h2>Combination</h2><div class="dial-row" id="dials"></div><p style="text-align:center;opacity:.8;font-size:13px">Tap a dial to turn it.</p><div class="modal-actions"><button class="btn btn-primary btn-small" id="turn">Turn handle</button></div>`);
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
