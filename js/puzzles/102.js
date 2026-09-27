// Room 102 – The Clock. The stopped clock gives the keypad code 09:15.
export default function mount(ctx) {
  const { hotspot, showCard, showKeypad, toast, solve } = ctx;
  const CODE = '0915';

  hotspot({ x: 30, y: 30, w: 40, h: 47, label: 'Door', onTap: () => toast('The lock is electronic. Try the keypad.') });

  const clockSvg = (hourDeg, minDeg) => `
    <svg viewBox="0 0 200 200" width="100%" style="max-width:220px;display:block;margin:0 auto">
      <circle cx="100" cy="100" r="92" fill="#f4ead2" stroke="#d9a441" stroke-width="8"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, x = 100 + Math.sin(a) * 74, y = 100 - Math.cos(a) * 74;
        return `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Georgia" font-size="18" fill="#2b2317">${i === 0 ? 12 : i}</text>`;
      }).join('')}
      <line x1="100" y1="100" x2="${100 + Math.sin(hourDeg * Math.PI / 180) * 44}" y2="${100 - Math.cos(hourDeg * Math.PI / 180) * 44}" stroke="#2b2317" stroke-width="7" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${100 + Math.sin(minDeg * Math.PI / 180) * 66}" y2="${100 - Math.cos(minDeg * Math.PI / 180) * 66}" stroke="#2b2317" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="5" fill="#d9a441"/>
    </svg>`;

  hotspot({ x: 2, y: 31, w: 18, h: 13, circle: true, label: 'Clock', onTap: () => {
    showCard(`<h2>The lobby clock</h2>${clockSvg(277.5, 90)}<p style="text-align:center;opacity:.85">It stopped the night the guests vanished, and nobody has dared to wind it since.</p>`);
  } });

  hotspot({ x: 70, y: 46, w: 11, h: 12, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 102', onSolve: solve }) });
}
