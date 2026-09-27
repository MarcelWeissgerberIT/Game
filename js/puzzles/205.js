// Room 205 – The Lever. Pull the lever, memorise the flash order, then tap the medallions in that order before time runs out.
export default function mount(ctx) {
  const { hotspot, glow, toast, solve, audio, haptic } = ctx;
  const MEDS = [{ x: 5, y: 10, w: 14, h: 9 }, { x: 42, y: 17, w: 16, h: 9 }, { x: 81, y: 30, w: 16, h: 9 }, { x: 5, y: 41, w: 14, h: 9 }, { x: 83, y: 67, w: 14, h: 10 }];
  const ORDER = [2, 0, 4, 1, 3];
  const LIMIT = 9000;
  let phase = 'idle', progress = 0, timers = [], deadline = 0, ticker = 0;

  hotspot({ x: 27, y: 30, w: 46, h: 47, label: 'Door', onTap: () => toast(phase === 'idle' ? 'Steel. Bolted from within.' : 'Not yet.') });

  const glows = MEDS.map((m) => glow({ x: m.x - 4, y: m.y - 6, w: m.w + 8, h: m.h + 12 }));
  const clear = () => { timers.forEach(clearTimeout); timers = []; clearInterval(ticker); glows.forEach((g) => g.classList.remove('on')); };
  const reset = (msg) => { clear(); phase = 'idle'; progress = 0; audio.error(); haptic([60, 40, 60]); toast(msg); };

  MEDS.forEach((m, i) => hotspot({ x: m.x, y: m.y, w: m.w, h: m.h, circle: true, label: `Medallion ${i + 1}`, onTap: () => {
    if (phase === 'idle') { toast('A sunburst medallion. Cold to the touch.'); return; }
    if (phase !== 'go') return;
    if (ORDER[progress] === i) {
      glows[i].classList.add('on'); audio.tone(500 + progress * 90, 0.15, 'triangle'); haptic(10);
      progress++;
      if (progress === ORDER.length) { clear(); glows.forEach((g) => g.classList.add('on')); phase = 'done'; setTimeout(solve, 400); }
    } else reset('The bolts slam back into place.');
  } }));

  hotspot({ x: 80, y: 44, w: 13, h: 15, label: 'Lever', onTap: () => {
    if (phase !== 'idle') return;
    phase = 'show'; progress = 0; audio.init(); audio.tone(200, 0.3, 'sawtooth', 0.05); haptic(30);
    toast('Watch.');
    ORDER.forEach((idx, k) => {
      timers.push(setTimeout(() => { glows[idx].classList.add('on'); audio.tone(500 + k * 90, 0.2, 'triangle'); }, 700 + k * 650));
      timers.push(setTimeout(() => glows[idx].classList.remove('on'), 700 + k * 650 + 420));
    });
    timers.push(setTimeout(() => {
      phase = 'go'; deadline = Date.now() + LIMIT; toast('Now. Quickly.', 1200);
      ticker = setInterval(() => {
        const left = deadline - Date.now();
        if (left <= 0) reset('Too slow. The lever springs back.');
        else if (left < 3000) audio.tone(900, 0.05, 'square', 0.02);
      }, 500);
    }, 700 + ORDER.length * 650 + 300));
  } });

  return clear;
}
