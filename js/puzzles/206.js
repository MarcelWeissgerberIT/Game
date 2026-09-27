// Room 206 – The Piano. Play the notes written on the sheet.
export default function mount(ctx) {
  const { hotspot, showCard, toast, solve, audio, haptic, el, place, layer } = ctx;
  const MELODY = ['G', 'E', 'C', 'D', 'G'];
  const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const FREQ = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88 };
  const X0 = 11, X1 = 89;
  let progress = 0, done = false;

  hotspot({ x: 33, y: 30, w: 34, h: 27, label: 'Door', onTap: () => toast('Locked. The piano has been rolled in front of it.') });

  hotspot({ x: 38, y: 53, w: 24, h: 16, label: 'Sheet music', onTap: () => {
    // treble staff with five notes; letter names written underneath
    const pos = { C: 100, D: 95, E: 90, F: 85, G: 80, A: 75, B: 70 }; // y of note heads (C below the staff)
    const notes = MELODY.map((n, i) => { const x = 70 + i * 55, y = pos[n]; return `<ellipse cx="${x}" cy="${y}" rx="8" ry="5.5" fill="#2b2317" transform="rotate(-20 ${x} ${y})"/><line x1="${x + 7}" y1="${y - 2}" x2="${x + 7}" y2="${y - 40}" stroke="#2b2317" stroke-width="2"/>${n === 'C' ? `<line x1="${x - 13}" y1="${y}" x2="${x + 13}" y2="${y}" stroke="#2b2317" stroke-width="1.5"/>` : ''}<text x="${x}" y="128" text-anchor="middle" font-family="Georgia" font-size="16" fill="#2b2317">${n}</text>`; }).join('');
    showCard(`<h2>The sheet</h2><div class="note" style="transform:none;padding:10px"><svg viewBox="0 0 360 140" width="100%">
      ${[50, 60, 70, 80, 90].map((y) => `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="#2b2317" stroke-width="1.5"/>`).join('')}
      <text x="24" y="92" font-family="Georgia" font-size="58" fill="#2b2317">&#119070;</text>
      ${notes}
    </svg><p style="margin:6px 0 0;font-size:12px">"For the night porter. Play it and the door will hear."</p></div>`);
  } });

  KEYS.forEach((note, i) => {
    const w = (X1 - X0) / KEYS.length;
    hotspot({ x: X0 + i * w, y: 68, w, h: 7, label: `Key ${note}${i < 7 ? 1 : 2}`, onTap: () => {
      if (done) return;
      audio.init();
      const f = FREQ[note] * (i < 7 ? 1 : 2);
      audio.tone(f, 0.5, 'triangle', 0.1); haptic(6);
      // visible key press, so the room works with the sound off
      const flash = el('div', 'key-flash'); place(flash, { x: X0 + i * w, y: 68, w, h: 7 }); layer.appendChild(flash);
      setTimeout(() => flash.remove(), 260);
      const label = el('div', 'note-label', note); place(label, { x: X0 + i * w - 2, y: 60, w: w + 4, h: 7 }); layer.appendChild(label);
      setTimeout(() => label.remove(), 800);
      if (MELODY[progress] === note) {
        progress++;
        toast(MELODY.slice(0, progress).join(' \u00b7 '), 1200);
        if (progress === MELODY.length) { done = true; setTimeout(() => { audio.ding(); solve(); }, 500); }
      } else {
        progress = note === MELODY[0] ? 1 : 0;
        audio.tone(f * 1.06, 0.4, 'sawtooth', 0.04);
        toast(progress ? note : `${note} \u2717`, 1200);
      }
    } });
  });
}
