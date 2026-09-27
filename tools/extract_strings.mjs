// Dump every player-visible string from the level data (titles, intros, hints, clue texts, flavors).
import { LEVELS } from '../js/levels.js';
const out = new Set();
const SKIP_KEYS = new Set(['word', 'code', 'image', 'kind', 'at', 'id', 'icon', 'glyph', 'align', 'melody', 'letters', 'requires', 'custom', 'layout', 'rule']);
const walk = (v, key) => {
  if (typeof v === 'string') { if (!SKIP_KEYS.has(key) && /[A-Za-z]{2,}/.test(v) && !/^[IVXLC·\s]+$/.test(v)) out.add(v); }
  else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (typeof x !== 'function') walk(x, k); }
};
for (const lv of LEVELS) { out.add(lv.floor); out.add(lv.title); if (lv.intro) out.add(lv.intro); lv.hints.forEach((h) => out.add(h)); if (lv.spec) walk(lv.spec, ''); }
console.log(JSON.stringify([...out], null, 1));
