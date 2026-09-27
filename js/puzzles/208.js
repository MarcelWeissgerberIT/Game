// Room 208 – The Cipher Wheel. Align the inner ring as the sign says, then read off the code.
export default function mount(ctx) {
  const { hotspot, showCard, showKeypad, toast, solve, $, audio, haptic } = ctx;
  const LETTERS = 'ABCDEFGHIJ'.split('');
  const CODE = '6250'; // with E = 9: A5 B6 C7 D8 E9 F0 G1 H2 I3 J4 -> B H A F
  let offset = 0;

  hotspot({ x: 32, y: 30, w: 38, h: 47, label: 'Door', onTap: () => toast('Locked.') });

  hotspot({ x: 30, y: 21, w: 40, h: 7, label: 'Sign', onTap: () => {
    showCard(`<h2>Guest suites</h2><p style="text-align:center;opacity:.8;font-size:13px">Scratched into the brass beneath the letters:</p><div class="clue-row" style="font-family:Georgia;font-size:26px;color:#f3c96b">E = 9</div><div class="clue-row" style="font-family:Georgia;font-size:30px;letter-spacing:.3em;color:#f3c96b">B H A F</div>`);
  } });

  hotspot({ x: 2, y: 38, w: 24, h: 19, circle: true, label: 'Cipher wheel', onTap: () => {
    const body = showCard(`<h2>Cipher wheel</h2><svg viewBox="0 0 300 300" width="100%" id="wheel"></svg>
      <div class="modal-actions"><button class="btn btn-ghost btn-small" id="ccw">&#8630;</button><button class="btn btn-ghost btn-small" id="cw">&#8631;</button></div>`);
    const svg = $('#wheel', body);
    const draw = () => {
      const ring = (r, items, fill, rot) => items.map((t, i) => { const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + rot; const x = 150 + Math.cos(a) * r, y = 150 + Math.sin(a) * r; return `<text x="${x}" y="${y + 8}" text-anchor="middle" font-family="Georgia" font-size="24" fill="${fill}">${t}</text>`; }).join('');
      svg.innerHTML = `<circle cx="150" cy="150" r="140" fill="#1c1409" stroke="#d9a441" stroke-width="4"/><circle cx="150" cy="150" r="92" fill="#2a1d10" stroke="#d9a441" stroke-width="3"/>
        <path d="M150 4 L142 22 L158 22 Z" fill="#f3c96b"/>
        ${ring(116, LETTERS, '#f3c96b', 0)}${ring(68, [...Array(10).keys()], '#f2e6c8', (offset / 10) * Math.PI * 2)}`;
    };
    draw();
    $('#cw', body).addEventListener('click', () => { offset = (offset + 1) % 10; audio.click(); haptic(6); draw(); });
    $('#ccw', body).addEventListener('click', () => { offset = (offset + 9) % 10; audio.click(); haptic(6); draw(); });
  } });

  hotspot({ x: 80, y: 44, w: 12, h: 14, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 208', onSolve: solve }) });
}
