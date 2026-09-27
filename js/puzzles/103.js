// Room 103 – The Mirror. Wipe the fog off the mirror to reveal the code.
export default function mount(ctx) {
  const { hotspot, showCard, showKeypad, toast, solve, $, audio } = ctx;
  const CODE = '2847';
  let revealed = false;

  hotspot({ x: 32, y: 30, w: 38, h: 47, label: 'Door', onTap: () => toast('Locked.') });
  hotspot({ x: 62, y: 50, w: 8, h: 10, label: 'Sign', onTap: () => showCard(`<h2>Door hanger</h2><div class="note"><p style="margin:0;font-size:12px;letter-spacing:.2em">DO NOT DISTURB</p><div class="big" style="font-size:18px;letter-spacing:.05em">the guest writes from the other side of the glass</div></div>`) });

  hotspot({ x: 2, y: 32, w: 24, h: 32, label: 'Mirror', onTap: () => {
    const body = showCard(`<h2>Fogged mirror</h2><div class="wipe-wrap"><div class="wipe-text mirrored">${CODE}</div><canvas id="fog"></canvas></div><p style="text-align:center;opacity:.8;font-size:13px">Wipe the glass with your finger.</p>`);
    const wrap = $('.wipe-wrap', body);
    const canvas = $('#fog', body);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = wrap.clientWidth, H = wrap.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    // fog: pale haze with a little grain
    g.fillStyle = '#c9d5d8'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${200 + Math.random() * 40},${210 + Math.random() * 30},${215 + Math.random() * 30},${0.35})`;
      const r = 6 + Math.random() * 18;
      g.beginPath(); g.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = 'destination-out';
    let wiping = false, cleared = 0;
    const wipe = (e) => {
      const b = canvas.getBoundingClientRect();
      const x = e.clientX - b.left, y = e.clientY - b.top;
      g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.fill();
      if (++cleared % 25 === 0) audio.click();
    };
    canvas.addEventListener('pointerdown', (e) => { wiping = true; canvas.setPointerCapture(e.pointerId); wipe(e); });
    canvas.addEventListener('pointermove', (e) => { if (wiping) wipe(e); });
    canvas.addEventListener('pointerup', () => { wiping = false; if (cleared > 40 && !revealed) { revealed = true; } });
    canvas.addEventListener('pointercancel', () => { wiping = false; });
  } });

  hotspot({ x: 80, y: 47, w: 12, h: 11, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 103', onSolve: solve }) });
}
