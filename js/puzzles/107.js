// Room 107 – The Chandelier. Shake the phone (or tap repeatedly) until the key falls.
export default function mount(ctx) {
  const { hotspot, item, icons, inventory, toast, solve, $, audio, haptic, requestMotion } = ctx;
  const NEEDED = 4;
  let shakes = 0, fallen = false, last = 0, askedMotion = false;
  const img = $('#room-img');
  const touch = 'ontouchstart' in window;

  const swing = () => { img.classList.remove('sway'); void img.offsetWidth; img.classList.add('sway'); audio.tone(1400 + Math.random() * 600, 0.15, 'sine', 0.04); };
  const registerShake = () => {
    if (fallen) return;
    const now = Date.now();
    if (now - last < 250) return;
    last = now; shakes++; swing(); haptic(10);
    if (shakes >= NEEDED) {
      fallen = true;
      window.removeEventListener('devicemotion', onMotion);
      item({ x: 46, y: 78, w: 9, h: 6, icon: icons.key, cls: 'drop glint', onTap: (k) => {
        inventory.add('key', icons.key, 'Brass key'); k.remove(); toast('A key, still warm from the lamps.');
      } });
      toast('Something clatters onto the marble.');
    } else if (shakes === 1) {
      toast(touch ? 'The chandelier sways. Shake harder!' : 'The chandelier sways. Keep tapping!');
    }
  };
  let lastMag = null;
  const onMotion = (e) => {
    const a = e.accelerationIncludingGravity; if (!a) return;
    const mag = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    if (lastMag !== null && Math.abs(mag - lastMag) > 14) registerShake();
    lastMag = mag;
  };
  const armMotion = async () => {
    if (askedMotion) return; askedMotion = true;
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      if (!(await requestMotion())) return;
    }
    window.addEventListener('devicemotion', onMotion);
  };
  if (touch && !(window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function')) armMotion();

  hotspot({ x: 27, y: 30, w: 45, h: 47, label: 'Door', onTap: () => toast('Locked. A keyhole below the handle.') });
  hotspot({ x: 30, y: 4, w: 40, h: 24, label: 'Chandelier', onTap: () => { armMotion(); registerShake(); } });
  hotspot({ x: 30, y: 52, w: 11, h: 13, label: 'Lock', onTap: () => {
    if (inventory.selected === 'key') { inventory.remove('key'); solve(); }
    else if (inventory.has('key')) toast('Select the key first.');
    else toast('A keyhole. Something glints up in the chandelier.');
  } });

  return () => window.removeEventListener('devicemotion', onMotion);
}
