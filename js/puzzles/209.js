// Room 209 – The Memory. Press the button, watch the lamps, repeat the growing sequence.
export default function mount(ctx) {
  const { hotspot, glow, toast, solve, audio, haptic } = ctx;
  const LAMPS = [{ x: 13, y: 8, w: 12, h: 9 }, { x: 33, y: 8, w: 12, h: 9 }, { x: 55, y: 8, w: 12, h: 9 }, { x: 75, y: 8, w: 12, h: 9 }];
  const SEQ = [1, 3, 0, 2, 2, 1];
  const ROUNDS = [3, 5, 6];
  const TONES = [392, 494, 587, 698];
  let round = 0, phase = 'idle', progress = 0, timers = [];

  hotspot({ x: 32, y: 30, w: 38, h: 47, label: 'Door', onTap: () => toast('Locked. A brass button, worn smooth by many thumbs.') });

  const glows = LAMPS.map((l) => glow({ x: l.x - 4, y: l.y - 6, w: l.w + 8, h: l.h + 12 }));
  const flash = (i, ms = 380) => { glows[i].classList.add('on'); audio.tone(TONES[i], ms / 1000, 'triangle', 0.08); timers.push(setTimeout(() => glows[i].classList.remove('on'), ms)); };
  const clear = () => { timers.forEach(clearTimeout); timers = []; glows.forEach((g) => g.classList.remove('on')); };
  const play = () => {
    phase = 'show'; progress = 0; clear();
    const len = ROUNDS[round];
    for (let k = 0; k < len; k++) timers.push(setTimeout(() => flash(SEQ[k]), 600 + k * 620));
    timers.push(setTimeout(() => { phase = 'input'; }, 600 + len * 620));
  };

  LAMPS.forEach((l, i) => hotspot({ x: l.x, y: l.y, w: l.w, h: l.h, circle: true, label: `Lamp ${i + 1}`, onTap: () => {
    if (phase !== 'input') return;
    audio.init(); flash(i, 250); haptic(8);
    if (SEQ[progress] === i) {
      progress++;
      if (progress === ROUNDS[round]) {
        round++;
        if (round === ROUNDS.length) { phase = 'done'; setTimeout(() => { glows.forEach((g) => g.classList.add('on')); audio.ding(); solve(); }, 400); }
        else { phase = 'wait'; toast('The lamps hum. Again.', 1200); timers.push(setTimeout(play, 1400)); }
      }
    } else { phase = 'idle'; round = 0; audio.error(); haptic([60, 40, 60]); toast('The lamps go dark. Press the button to start over.'); }
  } }));

  hotspot({ x: 44, y: 50, w: 12, h: 9, circle: true, label: 'Button', onTap: () => {
    if (phase === 'show' || phase === 'wait' || phase === 'done') return;
    audio.init(); audio.tone(150, 0.2, 'square', 0.05); haptic(20); round = 0; play();
  } });

  return clear;
}
