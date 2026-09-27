// Room 203 – The Plaque. The plaque hangs upside down; turn the phone over to read it.
export default function mount(ctx) {
  const { hotspot, showCard, showKeypad, toast, solve, $, el, requestMotion } = ctx;
  const CODE = '9618';
  let onOrient = null;

  hotspot({ x: 27, y: 20, w: 48, h: 57, label: 'Door', onTap: () => toast('Locked. The whole room feels slightly wrong.') });

  hotspot({ x: 2, y: 29, w: 20, h: 21, label: 'Plaque', onTap: async () => {
    const body = showCard(`<h2>The plaque</h2><div class="plaque" id="plaque"><div class="plaque-text">NINE &middot; SIX<br>ONE &middot; EIGHT</div></div><div id="plaque-help" style="text-align:center;font-size:13px;opacity:.75;margin-top:10px">Mounted upside down. The hooks are rusted fast.</div>`,
      { onClose: () => { if (onOrient) window.removeEventListener('deviceorientation', onOrient); onOrient = null; } });
    const plaque = $('#plaque', body), help = $('#plaque-help', body);
    const flip = (up) => plaque.classList.toggle('upright', up);
    const touch = 'ontouchstart' in window;
    if (touch) {
      const needs = window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function';
      const arm = () => {
        onOrient = (e) => { if (e.beta == null) return; flip(e.beta < -45 || (typeof screen.orientation !== 'undefined' && screen.orientation.type === 'portrait-secondary')); };
        window.addEventListener('deviceorientation', onOrient);
      };
      if (needs) {
        const b = el('button', 'btn btn-ghost btn-small', 'Allow motion'); b.style.marginTop = '8px';
        b.addEventListener('click', async () => { if (await requestMotion()) { arm(); b.remove(); } });
        help.appendChild(b);
      } else arm();
    } else {
      // No sensors on a desktop: offer to take the plaque off the wall after a moment.
      setTimeout(() => {
        const b = el('button', 'btn btn-ghost btn-small', 'Lift it off the hooks'); b.style.marginTop = '8px';
        b.addEventListener('click', () => flip(!plaque.classList.contains('upright')));
        help.appendChild(b);
      }, 6000);
    }
  } });

  hotspot({ x: 81, y: 42, w: 11, h: 15, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 203', onSolve: solve }) });

  return () => { if (onOrient) window.removeEventListener('deviceorientation', onOrient); };
}
