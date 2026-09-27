// Clue card renderers for the generated floors. Each returns HTML for ctx.showCard.
import { t } from '../i18n.js';
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'];
export const roman = (n) => ROMAN[n] ?? String(n);
const note = (inner, title) => `${title ? `<h2>${title}</h2>` : ''}<div class="note">${inner}</div>`;
const plaque = (inner, title) => `${title ? `<h2>${title}</h2>` : ''}<div class="plaque upright">${inner}</div>`;

export const CLUES = {
  text: ({ title = 'A note', lines }) => note(lines.map((l) => `<p style="margin:6px 0">${l}</p>`).join(''), title),
  roman: ({ title = 'A note', digits, caption = '' }) => note(`<div class="big">${digits.map((d) => roman(+d)).join(' · ')}</div>${caption ? `<p style="margin:0;font-size:12px">${caption}</p>` : ''}`, title),
  mirrored: ({ title = 'A note', text, caption = 'Written in a hurry, or from the other side.' }) => note(`<div class="big mirrored">${text}</div><p style="margin:0;font-size:12px">${caption}</p>`, title),
  clock: ({ title = 'The clock', hour, minute, mirror = false, caption = '' }) => {
    const hd = ((hour % 12) + minute / 60) * 30, md = minute * 6;
    const svg = `<svg viewBox="0 0 200 200" width="100%" style="max-width:220px;display:block;margin:0 auto"><circle cx="100" cy="100" r="92" fill="#f4ead2" stroke="#d9a441" stroke-width="8"/>
      ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<text x="${100 + Math.sin(a) * 74}" y="${100 - Math.cos(a) * 74 + 6}" text-anchor="middle" font-family="Georgia" font-size="18" fill="#2b2317">${i === 0 ? 12 : i}</text>`; }).join('')}
      <line x1="100" y1="100" x2="${100 + Math.sin(hd * Math.PI / 180) * 44}" y2="${100 - Math.cos(hd * Math.PI / 180) * 44}" stroke="#2b2317" stroke-width="7" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${100 + Math.sin(md * Math.PI / 180) * 66}" y2="${100 - Math.cos(md * Math.PI / 180) * 66}" stroke="#2b2317" stroke-width="4" stroke-linecap="round"/><circle cx="100" cy="100" r="5" fill="#d9a441"/></svg>`;
    return `<h2>${title}</h2>${mirror ? `<div class="mirrored">${svg}</div>` : svg}<p style="text-align:center;opacity:.85">${caption}</p>`;
  },
  count: ({ title = 'The picture', groups, caption = '' }) => {
    // groups: [{ glyph, n }] drawn scattered; the player counts each glyph
    let seed = groups.reduce((a, g) => a + g.n * 31, 7); const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const items = groups.flatMap((g) => Array.from({ length: g.n }, () => g.glyph));
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    const cells = items.map((g) => `<div style="font-size:26px;text-align:center;color:#f3c96b;transform:rotate(${Math.floor(rnd() * 40 - 20)}deg)">${g}</div>`).join('');
    return `<h2>${title}</h2><div style="border:6px solid #d9a441;border-radius:4px;background:#0b1420;padding:12px;display:grid;grid-template-columns:repeat(6,1fr);gap:6px">${cells}</div><p style="text-align:center;opacity:.8;font-size:13px">${caption}</p>`;
  },
  tally: ({ title = 'Scratched into the wood', digits, caption = '' }) => note(digits.map((d) => `<div style="font-family:monospace;font-size:26px;letter-spacing:.1em;margin:4px 0">${'|'.repeat(+d) || '&empty;'}</div>`).join('') + (caption ? `<p style="margin:0;font-size:12px">${caption}</p>` : ''), title),
  symbols: ({ title = 'Engraved marks', legend, order, caption = '' }) => `<h2>${title}</h2>
    ${order ? `<div class="clue-row" style="color:#f3c96b">${order.join(' ')}</div>` : ''}
    ${legend ? `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0">${legend.map(([g, n]) => `<div style="border:1px solid #d9a441;border-radius:6px;padding:8px 4px;text-align:center"><div style="font-size:26px;color:#f3c96b">${g}</div><div style="font-family:Georgia;font-size:14px">${n}</div></div>`).join('')}</div>` : ''}
    <p style="text-align:center;opacity:.8;font-size:13px">${caption}</p>`,
  letters: ({ title = 'A note', word, caption = 'A is the first letter. Count from there.' }) => note(`<div class="big">${word.split('').join(' ')}</div><p style="margin:0;font-size:12px">${caption}</p>`, title),
  binary: ({ title = 'The lamps', bits, caption = 'Lit and unlit. Read them as a number.' }) => `<h2>${title}</h2><div class="switch-row" style="gap:10px">${bits.map((b) => `<div class="lamp${b ? ' on' : ''}"></div>`).join('')}</div><p style="text-align:center;opacity:.8;font-size:13px">${caption}</p>`,
  dominoes: ({ title = 'Dominoes', pairs, caption = 'Left to right.' }) => `<h2>${title}</h2><div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">${pairs.map(([a, b]) => `<div style="display:flex;border:2px solid #f3c96b;border-radius:6px;background:#f4ead2;color:#2b2317;font-family:Georgia;font-size:22px"><div style="padding:8px 12px;border-right:2px solid #2b2317">${'•'.repeat(a) || '&nbsp;'}</div><div style="padding:8px 12px">${'•'.repeat(b) || '&nbsp;'}</div></div>`).join('')}</div><p style="text-align:center;opacity:.8;font-size:13px">${caption}</p>`,
  morse: ({ title = 'Telegraph chart', table }) => `<h2>${title}</h2><div class="note" style="transform:none"><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;font-size:18px;text-align:left">${Object.entries(table).map(([d, m]) => `<div><b>${d}</b> &nbsp;<span style="letter-spacing:.15em">${m.replace(/\./g, '&bull;').replace(/-/g, '&#8212;')}</span></div>`).join('')}</div><p style="margin:10px 0 0;font-size:12px">Short, long. A pause between figures.</p></div>`,
  sheet: ({ title = 'The sheet', melody, caption = '' }) => {
    const pos = { C: 100, D: 95, E: 90, F: 85, G: 80, A: 75, B: 70 };
    const notes = melody.map((n, i) => { const x = 70 + i * (270 / Math.max(melody.length - 1, 1)), y = pos[n]; return `<ellipse cx="${x}" cy="${y}" rx="8" ry="5.5" fill="#2b2317" transform="rotate(-20 ${x} ${y})"/><line x1="${x + 7}" y1="${y - 2}" x2="${x + 7}" y2="${y - 40}" stroke="#2b2317" stroke-width="2"/>${n === 'C' ? `<line x1="${x - 13}" y1="${y}" x2="${x + 13}" y2="${y}" stroke="#2b2317" stroke-width="1.5"/>` : ''}<text x="${x}" y="128" text-anchor="middle" font-family="Georgia" font-size="16" fill="#2b2317">${n}</text>`; }).join('');
    return `<h2>${title}</h2><div class="note" style="transform:none;padding:10px"><svg viewBox="0 0 360 140" width="100%">${[50, 60, 70, 80, 90].map((y) => `<line x1="20" y1="${y}" x2="340" y2="${y}" stroke="#2b2317" stroke-width="1.5"/>`).join('')}<text x="24" y="92" font-family="Georgia" font-size="58" fill="#2b2317">&#119070;</text>${notes}</svg>${caption ? `<p style="margin:6px 0 0;font-size:12px">${caption}</p>` : ''}</div>`;
  },
  weights: ({ title = 'The shelf', weights, target }) => note(`<p style="margin:0 0 6px;font-size:12px;letter-spacing:.2em">BRASS WEIGHTS</p><div class="big" style="font-size:22px">${weights.map((w) => roman(w)).join(' · ')}</div><p style="margin:0;font-size:12px">${t('The sealed box on the scale is stamped {r}.', { r: roman(target) })}</p>`, title),
  cipher: ({ title = 'Scratched into the brass', align, word }) => `<h2>${title}</h2><div class="clue-row" style="font-family:Georgia;font-size:26px;color:#f3c96b">${align}</div><div class="clue-row" style="font-family:Georgia;font-size:30px;letter-spacing:.3em;color:#f3c96b">${word.split('').join(' ')}</div>`,
  shape: ({ title = 'A shape', path, caption = 'Trace it in one stroke, starting at the ring.' }) => {
    const P = [50, 150, 250];
    return `<h2>${title}</h2><svg viewBox="0 0 300 300" width="70%" style="display:block;margin:0 auto;background:#0b1420;border:4px solid #d9a441;border-radius:8px"><polyline fill="none" stroke="#f3c96b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points="${path.map((k) => `${P[k % 3]},${P[Math.floor(k / 3)]}`).join(' ')}"/>${[...Array(9).keys()].map((i) => `<circle cx="${P[i % 3]}" cy="${P[Math.floor(i / 3)]}" r="9" fill="#2a1d10" stroke="#d9a441" stroke-width="3"/>`).join('')}<circle cx="${P[path[0] % 3]}" cy="${P[Math.floor(path[0] / 3)]}" r="18" fill="none" stroke="#f3c96b" stroke-width="3"/></svg><p style="text-align:center;opacity:.8;font-size:13px">${caption}</p>`;
  },
  plaque: ({ title = 'The plaque', lines }) => plaque(`<div class="plaque-text">${lines.join('<br>')}</div>`, title),
  order: ({ title = 'A note', items, caption = 'Counted from the left.' }) => note(`<div class="big">${items.join(' · ')}</div><p style="margin:0;font-size:12px">${caption}</p>`, title),
  math: ({ title = 'A riddle', lines, caption = '' }) => note(lines.map((l) => `<p style="margin:6px 0;font-family:Georgia">${l}</p>`).join('') + (caption ? `<p style="margin:8px 0 0;font-size:12px">${caption}</p>` : ''), title),
};
