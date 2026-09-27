// Room 210 – The Fuse. Find the fuse, restore power, then send the elevator to the right floor.
export default function mount(ctx) {
  const { hotspot, showCard, closeCard, toast, solve, inventory, $, el, audio, haptic } = ctx;
  const FLOORS = ['L', '1', '2', '3', '4', '5'];
  const TARGET = '3'; // digits of 210 summed
  let powered = false, taken = false, chosen = 0;
  const fuseIcon = `<svg viewBox="0 0 64 64"><rect x="14" y="20" width="36" height="24" rx="6" fill="#f4ead2" stroke="#b8842a" stroke-width="3"/><rect x="4" y="26" width="10" height="12" fill="#b8842a"/><rect x="50" y="26" width="10" height="12" fill="#b8842a"/><path d="M20 32 L44 32" stroke="#d9534f" stroke-width="3"/></svg>`;

  hotspot({ x: 30, y: 42, w: 40, h: 35, label: 'Elevator', onTap: () => toast(powered ? 'The cab waits. Where to?' : 'Dark. Not a flicker.') });

  hotspot({ x: 0, y: 63, w: 25, h: 5, label: 'Top drawer', onTap: () => toast('Stationery, yellowed with age.') });
  hotspot({ x: 0, y: 69, w: 25, h: 5, label: 'Middle drawer', onTap: () => toast('Stuck. Something rattles inside, but it will not open.') });
  hotspot({ x: 0, y: 74, w: 25, h: 5, label: 'Bottom drawer', onTap: (n) => {
    if (taken) { toast('Empty now.'); return; }
    taken = true; inventory.add('fuse', fuseIcon, 'Fuse'); toast('A glass fuse, still intact.');
  } });

  hotspot({ x: 76, y: 51, w: 18, h: 13, label: 'Fuse box', onTap: () => {
    if (powered) { toast('Humming steadily.'); return; }
    if (inventory.selected === 'fuse') { inventory.remove('fuse'); powered = true; audio.tone(120, 0.6, 'sawtooth', 0.06); haptic([20, 30, 20]); toast('The fuse seats with a click. Lights flicker on above the elevator.'); }
    else if (inventory.has('fuse')) toast('Select the fuse first.');
    else toast('One slot is empty. The others are burnt out.');
  } });

  hotspot({ x: 38, y: 29, w: 24, h: 11, label: 'Floor indicator', onTap: () => {
    if (!powered) { toast('The needle does not move.'); return; }
    const body = showCard(`<h2>Floor indicator</h2><p style="text-align:center;opacity:.8;font-size:13px">A brass plate reads: "Going up? Add this room together."</p><div class="floor-row" id="floors"></div><div class="modal-actions"><button class="btn btn-primary btn-small" id="go">Call</button></div>`);
    const row = $('#floors', body);
    const btns = FLOORS.map((f, i) => { const b = el('button', 'floor-btn' + (i === chosen ? ' on' : ''), f); b.addEventListener('click', () => { chosen = i; audio.click(); btns.forEach((x, k) => x.classList.toggle('on', k === chosen)); }); row.appendChild(b); return b; });
    $('#go', body).addEventListener('click', () => {
      if (FLOORS[chosen] === TARGET) { audio.ding(); closeCard(); solve(); }
      else { audio.error(); haptic([40, 40, 40]); toast('The cab lurches, then settles back.'); }
    });
  } });
}
