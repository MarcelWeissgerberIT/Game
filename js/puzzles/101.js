// Room 101 – The Key. Tutorial: tap the palm, pick up the key, use it on the lock.
export default function mount(ctx) {
  const { hotspot, item, icons, inventory, toast, solve, $ } = ctx;
  let dropped = false;

  hotspot({ x: 27, y: 27, w: 45, h: 50, label: 'Door', onTap: () => toast('Locked. There must be a key somewhere.') });

  hotspot({ x: 78, y: 58, w: 22, h: 9, label: 'Drawer', onTap: () => toast('The drawer holds nothing but dust and an old matchbook.') });

  hotspot({ x: 0, y: 32, w: 40, h: 46, label: 'Palm', onTap: () => {
    const img = $('#room-img');
    img.classList.remove('shake'); void img.offsetWidth; img.classList.add('shake');
    if (dropped) { toast('The palm rustles.'); return; }
    dropped = true;
    setTimeout(() => {
      item({ x: 20, y: 74, w: 9, h: 6, icon: icons.key, cls: 'drop glint', onTap: (k) => {
        inventory.add('key', icons.key, 'Brass key');
        k.remove();
        toast('A brass room key. Now, where does it go?');
      } });
      toast('Something fell out of the planter.');
    }, 300);
  } });

  hotspot({ x: 61, y: 48, w: 11, h: 14, label: 'Lock', onTap: () => {
    if (inventory.selected === 'key') { inventory.remove('key'); solve(); }
    else if (inventory.has('key')) toast('Select the key first.');
    else toast('A keyhole. No key.');
  } });
}
