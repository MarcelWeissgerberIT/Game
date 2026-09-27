// Room 105 – The Sconces. Light the four lamps in the order written on the card.
export default function mount(ctx) {
  const { hotspot, glow, showCard, toast, solve, audio, haptic } = ctx;
  const ORDER = [1, 3, 0, 2]; // II, IV, I, III (0-based)
  const xs = [22, 37, 52, 67];
  let progress = 0;
  let done = false;

  hotspot({ x: 22, y: 25, w: 55, h: 52, label: 'Door', onTap: () => toast('Two heavy doors. They will not budge while the lamps are dark.') });

  const glows = xs.map((x) => glow({ x: x - 3, y: 6, w: 17, h: 18 }));

  xs.forEach((x, i) => {
    hotspot({ x, y: 10, w: 11, h: 12, circle: true, label: `Lamp ${i + 1}`, onTap: () => {
      if (done) return;
      if (ORDER[progress] === i) {
        glows[i].classList.add('on'); audio.tone(440 + i * 110, 0.2, 'triangle'); haptic(10);
        progress++;
        if (progress === ORDER.length) { done = true; setTimeout(solve, 500); }
      } else {
        audio.error(); haptic([40, 40, 40]);
        glows.forEach((gl) => gl.classList.remove('on'));
        progress = 0;
        toast('The lamps flicker and die.');
      }
    } });
  });

  hotspot({ x: 42, y: 78, w: 16, h: 9, label: 'Card', onTap: () => {
    showCard(`<h2>A folded card</h2><div class="note"><p style="margin:0;font-size:13px;letter-spacing:.2em">HOUSEKEEPING ORDER</p><div class="big">II · IV · I · III</div><p style="margin:0;font-size:13px">Lights are counted from the left.</p></div>`);
  } });
}
