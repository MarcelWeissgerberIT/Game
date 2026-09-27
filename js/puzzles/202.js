// Room 202 – The Painting. A sliding-tile puzzle made from the painting itself; solving it reveals the code.
export default function mount(ctx) {
  const { hotspot, showKeypad, toast, solve, el, place, layer, stage, audio, haptic, level } = ctx;
  const CODE = '4172';
  const REGION = { x: 8, y: 31, w: 39, h: 24.5 }; // painting canvas, percent of the artwork
  const N = 3;
  let solved = false;

  hotspot({ x: 68, y: 26, w: 24, h: 51, label: 'Door', onTap: () => toast('Locked.') });

  // board: tiles[i] = original index shown at slot i; 8 = empty
  let tiles = [...Array(N * N).keys()];
  const rand = (() => { let s = 2020; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
  const emptyAt = () => tiles.indexOf(N * N - 1);
  const neighbours = (i) => { const r = Math.floor(i / N), c = i % N, out = []; if (r > 0) out.push(i - N); if (r < N - 1) out.push(i + N); if (c > 0) out.push(i - 1); if (c < N - 1) out.push(i + 1); return out; };
  let last = -1;
  for (let k = 0; k < 80; k++) {
    const e = emptyAt(); const opts = neighbours(e).filter((n) => n !== last);
    const pick = opts[Math.floor(rand() * opts.length)];
    [tiles[e], tiles[pick]] = [tiles[pick], tiles[e]]; last = e;
  }
  if (tiles.every((t, i) => t === i)) [tiles[0], tiles[1]] = [tiles[1], tiles[0]];

  const board = el('div', 'slide-board');
  place(board, REGION);
  layer.appendChild(board);
  const nodes = [];
  const layout = () => {
    const b = stage.getBoundingClientRect(), bb = board.getBoundingClientRect();
    const tw = bb.width / N, th = bb.height / N;
    nodes.forEach((n, i) => {
      const orig = tiles[i];
      n.style.width = tw + 'px'; n.style.height = th + 'px';
      n.style.left = (i % N) * tw + 'px'; n.style.top = Math.floor(i / N) * th + 'px';
      n.classList.toggle('empty', orig === N * N - 1);
      n.style.backgroundSize = `${b.width}px ${b.height}px`;
      const ox = bb.left - b.left + (orig % N) * tw, oy = bb.top - b.top + Math.floor(orig / N) * th;
      n.style.backgroundPosition = `${-ox}px ${-oy}px`;
    });
  };
  for (let i = 0; i < N * N; i++) {
    const n = el('div', 'slide-tile');
    n.style.backgroundImage = `url(${level.image})`;
    n.addEventListener('click', (e) => {
      e.stopPropagation(); if (solved) return;
      const e0 = emptyAt();
      if (!neighbours(i).includes(e0)) return;
      [tiles[i], tiles[e0]] = [tiles[e0], tiles[i]];
      audio.init(); audio.click(); haptic(6); layout();
      if (tiles.every((t, k) => t === k)) {
        solved = true; audio.ding();
        setTimeout(() => { board.classList.add('solved'); toast('The picture is whole again. Something is written in the corner.'); }, 300);
      }
    });
    board.appendChild(n); nodes.push(n);
  }
  if (ctx.DEBUG) window.__slide = () => ({ tiles: tiles.slice(), click: (i) => nodes[i].click() });
  layout();
  const ro = new ResizeObserver(layout); ro.observe(stage);

  hotspot({ x: 89, y: 44, w: 11, h: 13, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 202', onSolve: solve }) });

  return () => ro.disconnect();
}
