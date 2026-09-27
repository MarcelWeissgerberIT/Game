// Room 201 – The Signal. The sconce blinks a Morse message; the chart on the wall decodes it.
export default function mount(ctx) {
  const { hotspot, glow, showCard, showKeypad, toast, solve, audio } = ctx;
  const CODE = '725';
  const MORSE = { 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.' };
  const DOT = 220, DASH = 660, GAP = 220, LETTER_GAP = 1000, LOOP_GAP = 2600;

  hotspot({ x: 30, y: 23, w: 40, h: 54, label: 'Door', onTap: () => toast('Locked. Somewhere a relay clicks in rhythm.') });

  const lamp = glow({ x: 78, y: 22, w: 22, h: 24 });
  let timer = 0, alive = true;
  const schedule = () => {
    const steps = [];
    for (const ch of CODE) {
      for (const sym of MORSE[ch]) { steps.push([true, sym === '.' ? DOT : DASH]); steps.push([false, GAP]); }
      steps[steps.length - 1][1] = LETTER_GAP;
    }
    steps[steps.length - 1][1] = LOOP_GAP;
    let i = 0;
    const tick = () => {
      if (!alive) return;
      const [on, ms] = steps[i];
      lamp.classList.toggle('on', on);
      i = (i + 1) % steps.length;
      timer = setTimeout(tick, ms);
    };
    tick();
  };
  schedule();

  hotspot({ x: 8, y: 33, w: 18, h: 17, label: 'Chart', onTap: () => {
    showCard(`<h2>Telegraph chart</h2><div class="note" style="transform:none"><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;font-size:18px;text-align:left">
      ${Object.entries(MORSE).map(([d, m]) => `<div><b>${d}</b> &nbsp;<span style="letter-spacing:.15em">${m.replace(/\./g, '&bull;').replace(/-/g, '&#8212;')}</span></div>`).join('')}
    </div><p style="margin:10px 0 0;font-size:12px">Short, long. A pause between figures.</p></div>`);
  } });

  hotspot({ x: 60, y: 48, w: 11, h: 11, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 201', onSolve: () => { alive = false; clearTimeout(timer); solve(); } }) });

  return () => { alive = false; clearTimeout(timer); };
}
