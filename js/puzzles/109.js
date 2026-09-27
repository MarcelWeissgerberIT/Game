// Room 109 – The Wallpaper. Use the magnifying glass on the wall to find the hidden digits.
export default function mount(ctx) {
  const { hotspot, showCard, showKeypad, toast, solve, inventory, icons, $ } = ctx;
  const CODE = '6031';

  hotspot({ x: 30, y: 32, w: 40, h: 45, label: 'Door', onTap: () => toast('Locked.') });
  hotspot({ x: 23, y: 18, w: 54, h: 12, label: 'Marquee', onTap: () => showCard(`<h2>The marquee</h2><div class="clue-row" style="color:#f3c96b">\u2666 \u2736 \u263E \u2756</div><p style="text-align:center;opacity:.8;font-size:13px">Four glyphs glow among the bulbs, left to right.</p>`) });

  const inspect = () => {
    const body = showCard(`<h2>Under the glass</h2><div class="lens-wrap"><div class="lens-base"></div><div class="lens-secret" id="secret">
        <span style="transform:translateY(50px)"><small style="font-size:18px">\u263E</small>3</span><span style="transform:translateY(-70px)"><small style="font-size:18px">\u2756</small>1</span><span style="transform:translateY(-10px)"><small style="font-size:18px">\u2666</small>6</span><span style="transform:translateY(80px)"><small style="font-size:18px">\u2736</small>0</span>
      </div><div class="lens-ring" id="ring" style="left:50%;top:50%;opacity:0"></div></div><p style="text-align:center;opacity:.8;font-size:13px">Move the glass over the pattern.</p>`);
    const wrap = $('.lens-wrap', body), secret = $('#secret', body), ring = $('#ring', body);
    const R = 60;
    const move = (e) => {
      const b = wrap.getBoundingClientRect();
      const x = e.clientX - b.left, y = e.clientY - b.top;
      secret.style.clipPath = `circle(${R}px at ${x}px ${y}px)`;
      ring.style.left = x + 'px'; ring.style.top = y + 'px'; ring.style.opacity = 1;
    };
    let down = false;
    wrap.addEventListener('pointerdown', (e) => { down = true; wrap.setPointerCapture(e.pointerId); move(e); });
    wrap.addEventListener('pointermove', (e) => { if (down) move(e); });
    wrap.addEventListener('pointerup', () => { down = false; });
    wrap.addEventListener('pointercancel', () => { down = false; });
  };
  const wallTap = () => {
    if (inventory.selected === 'lens') inspect();
    else if (inventory.has('lens')) toast('Select the magnifying glass first.');
    else toast('Fans and sunbursts. Beautiful, but the pattern is too fine to make out.');
  };
  hotspot({ x: 0, y: 0, w: 27, h: 44, label: 'Left wall', onTap: wallTap });
  hotspot({ x: 0, y: 60, w: 27, h: 15, label: 'Left wall', onTap: wallTap });
  hotspot({ x: 73, y: 0, w: 27, h: 57, label: 'Right wall', onTap: wallTap });

  hotspot({ x: 79, y: 58, w: 17, h: 10, label: 'Magnifying glass', onTap: (n) => {
    inventory.add('lens', icons.lens, 'Magnifying glass'); n.remove(); toast('A heavy brass magnifying glass.');
  } });

  hotspot({ x: 8, y: 45, w: 13, h: 14, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 109', onSolve: solve }) });
}
