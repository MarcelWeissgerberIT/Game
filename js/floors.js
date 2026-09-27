// Floors 3-10: eighty rooms described as data, mounted by js/lib/room.js.
// Rooms x01-x05 use layout A (keypad right, frame left, note on the floor, one sconce),
// rooms x06-x10 use layout B (four sconces above the door, panel right, shelf left, note).
import { mountRoom } from './lib/room.js';
import { MORSE_TABLE } from './lib/widgets.js';
import { SPECIAL } from './puzzles/special.js';

const FLOOR_NAMES = { 3: 'Floor Three', 4: 'Floor Four', 5: 'Floor Five', 6: 'Floor Six', 7: 'Floor Seven', 8: 'Floor Eight', 9: 'Floor Nine', 10: 'Floor Ten' };
const FLOOR_INTRO = {
  3: 'The ballroom floor. Mirrors everywhere, and none of them show you.',
  4: 'The library floor. The books are all shelved by weight.',
  5: 'The bath floor. Steam curls under every door.',
  6: 'The kitchen floor. Copper pots, and something cooking that nobody ordered.',
  7: 'The observatory floor. The star charts are wrong in small ways.',
  8: 'The gallery floor. The paintings watch the corridor.',
  9: 'The penthouse floor. White marble, gold leaf, and no way down.',
  10: 'The rooftop floor. City lights below. The last doors.',
};
const ROMAN = { 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI', 22: 'XXII', 23: 'XXIII', 24: 'XXIV', 25: 'XXV' };
const G = { sun: '☀', moon: '☾', star: '★', diamond: '♦', spade: '♠', lily: '⚜', spark: '✶', cross: '❖', heart: '♥', club: '♣', bell: '⍾', key: '⚿' };
const COLORS = ['#e0524f', '#f3c96b', '#3fb8c9', '#7fd18a', '#c77dff', '#ff9f43'];
const LEGEND8 = [[G.sun, 20], [G.moon, 35], [G.star, 5], [G.diamond, 10], [G.spade, 25], [G.lily, 0], [G.spark, 15], [G.cross, 30]];
const STEPS8 = [0, 5, 10, 15, 20, 25, 30, 35];
const STEPS10 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// --- small builders ---
const keypad = (code, at = 'keypad', extra = {}) => ({ at, lock: { kind: 'keypad', code }, ...extra });
const clue = (at, c, extra = {}) => ({ at, clue: c, ...extra });
const item = (at, id, text, extra = {}) => ({ at, item: { id, icon: id, label: id, text }, ...extra });
const lamps = (n, presses, rule = 'neighbors') => { // start state = all on, then apply presses
  const s = Array(n).fill(1);
  const eff = (i) => rule === 'pair' ? [i, i + 1] : rule === 'skip' ? [i, i + 2, i - 2] : [i - 1, i, i + 1];
  presses.forEach((i) => eff(i).forEach((j) => { if (j >= 0 && j < n) s[j] ^= 1; }));
  return s;
};

const R = (id, layout, title, intro, hints, objects, doorText) => ({ id, layout, title, intro, hints, objects, doorText });
const S = (id, custom, title, intro, hints) => ({ id, custom, title, intro, hints, objects: [] });

// ---------------- Floor 3: warm-up with the classic tools ----------------
const F3 = [
  R(301, 'A', 'The Numerals', 'A note on the floor, a keypad by the door.', ['Roman numerals are still numbers.', 'IV II VII I is 4271.'],
    [clue('note', { kind: 'roman', digits: [4, 2, 7, 1], caption: 'Left to right.' }), keypad('4271')]),
  R(302, 'A', 'The Spare Key', 'Something is tucked behind the picture frame.', ['Check behind the picture.', 'Take the key, select it, tap the door.'],
    [item('frame', 'key', 'A spare key, taped behind the frame.'), { at: 'door', lock: { kind: 'keylock', item: 'key' }, flavor: 'A keyhole. Nothing in it.' }, clue('note', { kind: 'text', lines: ['Housekeeping: the spare is where the guests never look.'] })]),
  R(303, 'A', 'The Signal', 'The sconce by the keypad will not stop flickering.', ['The flicker is Morse. The picture frame holds the chart.', 'Short-short-long-long-long, then short-short-short-short-long, then long-short-short-short-short: 2, 4, 6.'],
    [clue('sconce', { kind: 'morselamp', code: '246' }), clue('frame', { kind: 'morse', table: MORSE_TABLE }), keypad('246')]),
  S(304, 'shadows', 'The Grille', 'A lamp on a rail, a brass grille, and a wall full of shadows.', ['The lamp slides. Somewhere along the rail the shadow stops being a mess.', 'Slide slowly. At the right spot the shadow reads 583.']),
  R(305, 'A', 'Half Past', 'A clock in the frame, stopped.', ['Hours, then minutes.', '7:30 is 0730.'],
    [clue('frame', { kind: 'clock', hour: 7, minute: 30, caption: 'Stopped at check-out.' }), keypad('0730')]),
  R(306, 'B', 'The Four Lamps', 'Four lamps above the door, all dark.', ['The note lists an order.', 'Third, first, fourth, second.'],
    [clue('note', { kind: 'order', items: ['III', 'I', 'IV', 'II'] }), { at: 'sconces', lock: { kind: 'sequence', order: [2, 0, 3, 1] } }]),
  R(307, 'B', 'Old Wiring', 'The panel hums. The lamps are wired together.', ['Each switch also flips its neighbours.', 'Flip the first and the third switch.'],
    [{ at: 'panel', lock: { kind: 'lightsout', lamps: lamps(4, [0, 2]), rule: 'neighbors' } }]),
  R(308, 'B', 'Loose Ends', 'Someone pulled the wires out of the panel.', ['Colour to colour.', 'Drag each wire straight to its match.'],
    [{ at: 'panel', lock: { kind: 'wires', colors: COLORS.slice(0, 4), right: [3, 0, 2, 1] } }]),
  R(309, 'B', 'Three Dials', 'A dial panel and a shelf of small brass tokens.', ['The tokens on the shelf carry symbols. The dials carry numbers.', 'Moon, lily, spark: 35, 0, 15.'],
    [clue('shelf', { kind: 'symbols', order: [G.moon, G.lily, G.spark], caption: 'Three tokens, left to right.' }), { at: 'panel', lock: { kind: 'dials', combo: [35, 0, 15], steps: STEPS8, legend: LEGEND8 } }]),
  R(310, 'B', 'The Balance', 'A brass scale sits behind the panel door.', ['Match the box with weights from the shelf.', 'Fourteen: V and IX, or II, III and IX.'],
    [clue('shelf', { kind: 'weights', weights: [2, 3, 5, 9, 11], target: 14 }), { at: 'panel', lock: { kind: 'scale', weights: [2, 3, 5, 9, 11], target: 14, roman: ROMAN } }]),
];

// ---------------- Floor 4: letters, tallies, fog and a first maze ----------------
const F4 = [
  R(401, 'A', 'The Alphabet', 'A word on the note. A keypad that only takes numbers.', ['A is 1, B is 2.', 'B E A D is 2514.'],
    [clue('note', { kind: 'letters', word: 'BEAD' }), keypad('2514')]),
  S(402, 'ink', 'Invisible Ink', 'A blank letter on the desk, and a candle burning low.', ['Heat brings some inks out. Hold your finger on the paper.', 'The letter spells it out: 7 2 9 4. It fades, so remember it.']),
  R(403, 'A', 'The Glass', 'The picture glass is fogged over.', ['Wipe it. The writing is backwards.', '6 1 9 3, read the right way round.'],
    [clue('frame', { kind: 'fog', text: '6193', mirrored: true, title: 'Fogged glass' }), keypad('6193')]),
  R(404, 'A', 'The Loupe', 'A jeweller\'s loupe lies on the note.', ['Use the loupe on the picture. The note gives the order.', 'Diamond, star, moon, sun: 8 0 4 7.'],
    [item('note', 'lens', 'A brass loupe. Someone dropped it in a hurry.'), clue('frame', { kind: 'lens', items: [{ glyph: G.moon, digit: 4, x: 30, y: 25 }, { glyph: G.diamond, digit: 8, x: 70, y: 40 }, { glyph: G.sun, digit: 7, x: 25, y: 70 }, { glyph: G.star, digit: 0, x: 65, y: 80 }] }, { requires: 'lens', flavor: 'A dark canvas. Something faint in the varnish.', label: 'Picture' }),
      keypad('8047'), clue('sconce', { kind: 'order', title: 'Scratched on the sconce', items: [G.diamond, G.star, G.moon, G.sun], caption: 'In this order.' })]),
  R(405, 'A', 'The Wheel', 'A cipher wheel is set into the frame.', ['Align the wheel as the note says, then read the letters as numbers.', 'With C = 0: A8 B9 C0 D1 E2 F3 G4 H5 I6 J7. G A D E is 4812.'],
    [clue('frame', { kind: 'wheel', letters: 'ABCDEFGHIJ'.split('') }), clue('note', { kind: 'cipher', align: 'C = 0', word: 'GADE' }), keypad('4812')]),
  R(406, 'B', 'Lamps Remember', 'Press the panel and watch the lamps.', ['Repeat what the lamps show. It grows.', 'Second, fourth, first, third, then third again.'],
    [{ at: 'panel', lock: { kind: 'memory', seq: [1, 3, 0, 2, 2], rounds: [3, 5] } }]),
  R(407, 'B', 'The Shape', 'The panel is a grid of nine studs.', ['The note shows a shape. Trace it in one stroke from the ring.', 'Top-left, centre, top-right, middle-right, bottom-right.'],
    [clue('note', { kind: 'shape', path: [0, 4, 2, 5, 8] }), { at: 'panel', lock: { kind: 'pattern', path: [0, 4, 2, 5, 8] } }]),
  R(408, 'B', 'Pieces', 'A photograph of this door, cut into nine pieces.', ['Slide the pieces until the door is whole.', 'Work row by row, top first.'],
    [{ at: 'panel', lock: { kind: 'slide', region: { x: 30, y: 30, w: 40, h: 47 }, seed: 408 }, label: 'Panel' }]),
  R(409, 'B', 'Dominoes', 'Dominoes lined up on the shelf.', ['Each domino is two digits.', 'Six dials: 3, 1, 4, 4, 0, 2.'],
    [clue('shelf', { kind: 'dominoes', pairs: [[3, 1], [4, 4], [0, 2]] }), { at: 'panel', lock: { kind: 'dials', combo: [3, 1, 4, 4, 0, 2], steps: STEPS10 } }]),
  R(410, 'B', 'The Lever', 'The panel is a lever. The lamps are waiting.', ['Pull it, memorise the flashes, repeat them fast.', 'Fourth, second, first, third.'],
    [{ at: 'panel', lock: { kind: 'timed', order: [3, 1, 0, 2], limit: 8000 }, label: 'Lever' }]),
];

// ---------------- Floor 5: mirrors, steam and longer codes ----------------
const F5 = [
  R(501, 'A', 'Reflected', 'The clock in the frame is a reflection.', ['Mirrors reverse the clock.', 'It really reads 4:20: 0420.'],
    [clue('frame', { kind: 'clock', hour: 4, minute: 20, mirror: true, caption: 'Seen in the mirrored wall.' }), keypad('0420')]),
  R(502, 'A', 'Backwards', 'The note is written backwards.', ['Read it in a mirror, or in your head.', '7 3 5 9 1.'],
    [clue('note', { kind: 'mirrored', text: '73591' }), keypad('73591')]),
  S(503, 'knocks', 'The Pipe', 'Steam, tiles, and a pipe that will not stop knocking.', ['Listen to the pipe. The knocks come in groups.', 'Two, one, four, three.']),
  R(504, 'A', 'Distractions', 'A picture full of shapes, but only some count.', ['The note says which shapes to count, and in which order.', 'Stars, hearts, spades: 4, 7, 3.'],
    [clue('frame', { kind: 'count', groups: [{ glyph: G.star, n: 4 }, { glyph: G.heart, n: 7 }, { glyph: G.spade, n: 3 }, { glyph: G.club, n: 5 }, { glyph: G.moon, n: 2 }] }), clue('note', { kind: 'order', items: [G.star, G.heart, G.spade], caption: 'Only these. In this order.' }), keypad('473')]),
  R(505, 'A', 'Arithmetic', 'A riddle on the note.', ['Do the sums.', 'Twelve dozen is 144, minus 1 is 143. Then 2. 1432.'],
    [clue('note', { kind: 'math', lines: ['Twelve dozen,', 'less the number of doors in this room,', 'then the number of your feet.'], caption: 'Write it all in a row.' }), keypad('1432')]),
  R(506, 'B', 'Five Taps', 'Four lamps, five taps.', ['Lamps may repeat.', 'First, first, third, fourth, second.'],
    [clue('note', { kind: 'order', items: ['I', 'I', 'III', 'IV', 'II'] }), { at: 'sconces', lock: { kind: 'sequence', order: [0, 0, 2, 3, 1] } }]),
  R(507, 'B', 'Paired Wiring', 'Five lamps. Each switch flips itself and the one to its right.', ['Start from the left and think ahead.', 'Flip switches 2 and 4.'],
    [{ at: 'panel', lock: { kind: 'lightsout', lamps: lamps(5, [1, 3], 'pair'), rule: 'pair', note: 'Each switch flips itself and the lamp to its right.' } }]),
  R(508, 'B', 'Five Wires', 'More wires than before.', ['Colour to colour.', 'Take them one at a time.'],
    [{ at: 'panel', lock: { kind: 'wires', colors: COLORS.slice(0, 5), right: [2, 4, 0, 1, 3] } }]),
  R(509, 'B', 'Four Dials', 'Four tokens on the shelf, four dials on the panel.', ['Symbols to numbers, as engraved on the rim.', 'Spade, sun, cross, star: 25, 20, 30, 5.'],
    [clue('shelf', { kind: 'symbols', order: [G.spade, G.sun, G.cross, G.star], caption: 'Four tokens, left to right.' }), { at: 'panel', lock: { kind: 'dials', combo: [25, 20, 30, 5], steps: STEPS8, legend: LEGEND8 } }]),
  R(510, 'B', 'Heavier', 'The scale again, the box heavier.', ['Nineteen. Three weights this time.', 'III, VII and IX.'],
    [clue('shelf', { kind: 'weights', weights: [3, 4, 7, 9, 13], target: 19 }), { at: 'panel', lock: { kind: 'scale', weights: [3, 4, 7, 9, 13], target: 19, roman: ROMAN } }]),
];

// ---------------- Floor 6: binary, longer memory, a maze, a piano ----------------
const F6 = [
  R(601, 'A', 'Lit and Unlit', 'The picture shows a row of lamps.', ['Lit is one, unlit is zero. Read the row as binary.', '1 0 1 1 is eleven: 11.'],
    [clue('frame', { kind: 'binary', bits: [1, 0, 1, 1] }), keypad('11')]),
  R(602, 'A', 'Backwards Again', 'The note is mirrored, and so is the picture.', ['Both are reversed. Read the note first.', 'The note says 8 2 6 0 4.'],
    [clue('note', { kind: 'mirrored', text: '82604', caption: 'Ink on the wrong side of the paper.' }), keypad('82604')]),
  R(603, 'A', 'Marks', 'Marks in the frame, a legend on the note.', ['The note maps marks to numbers, two digits each.', 'Cross, lily, diamond, spark: 30 00 10 15.'],
    [clue('note', { kind: 'symbols', legend: LEGEND8, caption: 'Two digits per mark.' }), clue('frame', { kind: 'symbols', order: [G.cross, G.lily, G.diamond, G.spark], caption: 'Read left to right.' }), keypad('30001015')]),
  R(604, 'A', 'Rolling', 'The keypad panel is a maze under glass.', ['Tilt, or use the arrows.', 'Take your time at the corners.'],
    [{ at: 'keypad', lock: { kind: 'maze', cols: 8, rows: 11, seed: 604 }, label: 'Panel' }]),
  R(605, 'A', 'Five in Fog', 'Fog on the glass. Five figures behind it.', ['Wipe, then read backwards.', '4 8 1 7 2.'],
    [clue('frame', { kind: 'fog', text: '48172', mirrored: true }), keypad('48172')]),
  R(606, 'B', 'Longer Memory', 'Press the panel. The lamps remember more now.', ['Two rounds. Six flashes at the end.', 'Fourth, first, third, first, second, fourth.'],
    [{ at: 'panel', lock: { kind: 'memory', seq: [3, 0, 2, 0, 1, 3], rounds: [4, 6] } }]),
  R(607, 'B', 'Faster', 'The lever again. Five flashes.', ['Watch, then repeat within eight seconds.', 'Second, fourth, third, first, fourth.'],
    [{ at: 'panel', lock: { kind: 'timed', order: [1, 3, 2, 0, 3], limit: 8000 }, label: 'Lever' }]),
  S(608, 'recipe', 'Kitchen Weights', 'A loaf on the scale. Apples, eggs and spoons on the counter.', ['The recipe book tells you what weighs what.', 'An egg is 1, a spoon 2, an apple 3, the loaf 8. Any mix that makes 8.']),
  R(609, 'B', 'Six Studs', 'A longer shape on the note.', ['One stroke, start at the ring.', 'Top-left, top-middle, centre, bottom-middle, bottom-right, middle-right.'],
    [clue('note', { kind: 'shape', path: [0, 1, 4, 7, 8, 5] }), { at: 'panel', lock: { kind: 'pattern', path: [0, 1, 4, 7, 8, 5] } }]),
  R(610, 'B', 'The Music Box', 'The panel hides a small keyboard.', ['The sheet is on the shelf.', 'E G A G E D.'],
    [clue('shelf', { kind: 'sheet', melody: ['E', 'G', 'A', 'G', 'E', 'D'] }), { at: 'panel', lock: { kind: 'piano', melody: ['E', 'G', 'A', 'G', 'E', 'D'] } }]),
];

// ---------------- Floor 7: observatory, bigger numbers, wider wheels ----------------
const F7 = [
  R(701, 'A', 'Constellations', 'The star chart in the frame is a count.', ['Count each glyph; the note gives the order.', 'Stars, sparks, moons, suns, crosses: 6, 2, 5, 3, 4.'],
    [clue('frame', { kind: 'count', groups: [{ glyph: G.star, n: 6 }, { glyph: G.spark, n: 2 }, { glyph: G.moon, n: 5 }, { glyph: G.sun, n: 3 }, { glyph: G.cross, n: 4 }] }), clue('note', { kind: 'order', items: [G.star, G.spark, G.moon, G.sun, G.cross] }), keypad('62534')]),
  R(702, 'A', 'Numerals', 'Roman numerals, five of them.', ['Some numerals are two digits.', 'XII, IX, III, XI: 12 9 3 11 is 129311.'],
    [clue('note', { kind: 'text', lines: ['XII · IX · III · XI'], title: 'Scratched into the note' }), keypad('129311')]),
  S(703, 'stars', 'The Porthole', 'A round window onto the night. The stars drift as you turn.', ['Pan across the sky. One patch of stars is too regular.', 'Four constellations shaped like digits: 3 1 6 2.']),
  R(704, 'A', 'The Loupe Again', 'Something in the varnish, too small to read.', ['The loupe is under the note. The sconce gives the order.', 'Bell, key, heart, club, lily: 5 2 9 4 0.'],
    [item('note', 'lens', 'The loupe. Someone keeps leaving it around.'), clue('frame', { kind: 'lens', items: [{ glyph: G.heart, digit: 9, x: 20, y: 20 }, { glyph: G.bell, digit: 5, x: 75, y: 30 }, { glyph: G.lily, digit: 0, x: 50, y: 50 }, { glyph: G.key, digit: 2, x: 25, y: 75 }, { glyph: G.club, digit: 4, x: 75, y: 80 }] }, { requires: 'lens', flavor: 'A dark canvas. Something faint in the varnish.', label: 'Picture' }),
      clue('sconce', { kind: 'order', title: 'Scratched on the sconce', items: [G.bell, G.key, G.heart, G.club, G.lily], caption: 'In this order.' }), keypad('52940')]),
  R(705, 'A', 'Pieces of the Night', 'The picture has been cut up.', ['Slide the pieces.', 'Corners first.'],
    [{ at: 'frame', lock: { kind: 'slide', region: { x: 10, y: 4, w: 80, h: 45 }, seed: 705 }, label: 'Picture' }]),
  R(706, 'B', 'Skipping', 'Six lamps. Each switch flips itself and the lamps two away.', ['Flip one switch and watch which lamps answer.', 'Each switch flips itself and the lamps two places away. Flip 1, 4 and 6.'],
    [{ at: 'panel', lock: { kind: 'lightsout', lamps: lamps(6, [0, 3, 5], 'skip'), rule: 'skip', note: 'Nobody remembers how this one is wired. Try a switch and watch.' } }]),
  R(707, 'B', 'Six Wires', 'Six wires, six terminals.', ['Colour to colour.', 'Purple and orange are new.'],
    [{ at: 'panel', lock: { kind: 'wires', colors: COLORS, right: [4, 0, 5, 1, 3, 2] } }]),
  R(708, 'B', 'Six Taps', 'Six taps on four lamps.', ['Repeats allowed.', 'Third, third, first, fourth, second, first.'],
    [clue('note', { kind: 'order', items: ['III', 'III', 'I', 'IV', 'II', 'I'] }), { at: 'sconces', lock: { kind: 'sequence', order: [2, 2, 0, 3, 1, 0] } }]),
  R(709, 'B', 'Three Rounds', 'The lamps remember in three rounds now.', ['Four, six, seven.', 'First, third, fourth, second, second, fourth, third.'],
    [{ at: 'panel', lock: { kind: 'memory', seq: [0, 2, 3, 1, 1, 3, 2], rounds: [4, 6, 7] } }]),
  R(710, 'B', 'Digits', 'Five dials, ten positions each.', ['The dominoes on the shelf give the digits.', '2-7, 5-0, then 9: 2 7 5 0 9.'],
    [clue('shelf', { kind: 'dominoes', pairs: [[2, 7], [5, 0], [9, 0]], caption: 'Left to right. The last domino is a single.' }), { at: 'panel', lock: { kind: 'dials', combo: [2, 7, 5, 0, 9], steps: STEPS10 } }]),
];

// ---------------- Floor 8: gallery, riddles and combinations ----------------
const F8 = [
  R(801, 'A', 'The Guest Book', 'A riddle on the note, a keypad by the door.', ['Old words for old numbers.', 'A gross is 144, a score is 20, a baker\'s dozen is 13: 1442013.'],
    [clue('note', { kind: 'math', lines: ['A gross of candles,', 'a score of guests,', 'a baker\'s dozen of keys.'], caption: 'Write the three numbers in a row.' }), keypad('1442013')]),
  R(802, 'A', 'Both Reversed', 'The clock is reflected. The note is mirrored.', ['The note says which is first.', 'Clock 10:45 then the note 3 1: 104531.'],
    [clue('frame', { kind: 'clock', hour: 10, minute: 45, mirror: true, caption: 'A reflection.' }), clue('note', { kind: 'mirrored', text: '31', caption: 'After the clock.' }), keypad('104531')]),
  S(803, 'spot', 'Twin Paintings', 'Two paintings, supposedly identical.', ['Five details differ. Tap them on the lower one.', 'A bird, a flag, a star, a window, a fish.']),
  R(804, 'A', 'Under Glass and Fog', 'The glass is fogged, and the writing beneath is tiny.', ['Wipe the glass first. The loupe from the note reads the sconce.', 'Fog says 30, then key, bell, spark. The sconce gives 7, 4, 9: 30749.'],
    [clue('frame', { kind: 'fog', text: `30 ${G.key}${G.bell}${G.spark}`, mirrored: false, title: 'Fogged glass' }), item('note', 'lens', 'The loupe again.'), clue('sconce', { kind: 'lens', items: [{ glyph: G.bell, digit: 4, x: 30, y: 30 }, { glyph: G.key, digit: 7, x: 70, y: 45 }, { glyph: G.spark, digit: 9, x: 40, y: 75 }] }, { requires: 'lens', flavor: 'Tiny scratches on the sconce. Too small.', label: 'Sconce' }),
      keypad('30749')]),
  R(805, 'A', 'Seven Studs', 'A long shape on the note.', ['One stroke.', 'Bottom-left, middle-left, top-left, centre, top-right, middle-right, bottom-right.'],
    [clue('note', { kind: 'shape', path: [6, 3, 0, 4, 2, 5, 8] }), { at: 'keypad', lock: { kind: 'pattern', path: [6, 3, 0, 4, 2, 5, 8] }, label: 'Panel' }]),
  R(806, 'B', 'Six Flashes', 'The lever. Six flashes, nine seconds.', ['Watch closely.', 'First, third, second, fourth, first, second.'],
    [{ at: 'panel', lock: { kind: 'timed', order: [0, 2, 1, 3, 0, 1], limit: 9000 }, label: 'Lever' }]),
  R(807, 'B', 'Twenty-three', 'The box weighs more each floor.', ['Twenty-three.', 'IV, VIII and XI.'],
    [clue('shelf', { kind: 'weights', weights: [4, 6, 8, 11, 14, 17], target: 23 }), { at: 'panel', lock: { kind: 'scale', weights: [4, 6, 8, 11, 14, 17], target: 23, roman: ROMAN } }]),
  R(808, 'B', 'Seven Notes', 'The music box again.', ['The sheet is on the shelf.', 'C E G E C D G.'],
    [clue('shelf', { kind: 'sheet', melody: ['C', 'E', 'G', 'E', 'C', 'D', 'G'] }), { at: 'panel', lock: { kind: 'piano', melody: ['C', 'E', 'G', 'E', 'C', 'D', 'G'] } }]),
  R(809, 'B', 'Pairs of Six', 'Six lamps, paired switches.', ['Each switch flips itself and the lamp to its right.', 'Flip switches 1, 2, 5 and 6.'],
    [{ at: 'panel', lock: { kind: 'lightsout', lamps: lamps(6, [0, 1, 4, 5], 'pair'), rule: 'pair', note: 'Each switch flips itself and the lamp to its right.' } }]),
  R(810, 'B', 'Legend and Order', 'Tokens on the shelf, a legend on the note, five dials.', ['Two steps: order from the shelf, numbers from the note.', 'Cross, sun, lily, moon, diamond: 30, 20, 0, 35, 10.'],
    [clue('shelf', { kind: 'symbols', order: [G.cross, G.sun, G.lily, G.moon, G.diamond], caption: 'Five tokens, left to right.' }), clue('note', { kind: 'symbols', legend: LEGEND8, caption: 'The rim legend, copied out.' }), { at: 'panel', lock: { kind: 'dials', combo: [30, 20, 0, 35, 10], steps: STEPS8 } }]),
];

// ---------------- Floor 9: gated objects and long sequences ----------------
const F9 = [
  R(901, 'A', 'Key Card', 'The keypad has a card slot. The slot is empty.', ['Find the card first. Then the note is your code.', 'The card is behind the picture. The note says 5 5 0 9 2 7.'],
    [item('frame', 'card', 'A brass-edged key card.'), clue('note', { kind: 'roman', digits: [5, 5, 0, 9, 2, 7], caption: 'Six figures.' }), keypad('550927', 'keypad', { requires: 'card', flavor: 'The keypad is dark. A card slot below it.' })]),
  R(902, 'A', 'Six Letters', 'A longer word on the note.', ['A is 1.', 'F A C A D E is 6 1 3 1 4 5.'],
    [clue('note', { kind: 'letters', word: 'FACADE' }), keypad('613145')]),
  R(903, 'A', 'Two Numbers', 'Two rows of lamps in the picture.', ['Each row is a binary number. First row, then second.', '1101 is 13, 0111 is 7: 137.'],
    [clue('frame', { kind: 'binary', bits: [1, 1, 0, 1], title: 'Upper row' }), clue('note', { kind: 'binary', bits: [0, 1, 1, 1], title: 'Lower row', caption: 'The second number.' }), keypad('137')]),
  S(904, 'elevator', 'Four Portraits', 'An elevator, a panel of ten buttons, and four portraits with opinions.', ['One portrait lies. Find the floor that fits the other three.', 'The maid lies. Even, below five, a square: floor 4.']),
  R(905, 'A', 'Twelve on the Wheel', 'The wheel again, wider.', ['Align, then read. The sconce carries the alignment.', 'Line K up under 9 and read B, J, E, K: 0839.'],
    [clue('frame', { kind: 'wheel', letters: 'ABCDEFGHIJKL'.split('') }), clue('sconce', { kind: 'cipher', title: 'Scratched on the sconce', align: 'K = 9', word: 'BJEK' }, { label: 'Sconce' }), keypad('0839')]),
  R(906, 'B', 'Two Rounds, Seven', 'Five then seven.', ['Watch, repeat, watch again.', 'Fourth, fourth, first, second, third, first, second.'],
    [{ at: 'panel', lock: { kind: 'memory', seq: [3, 3, 0, 1, 2, 0, 1], rounds: [5, 7] } }]),
  R(907, 'B', 'Crossed', 'Six wires, badly tangled.', ['The colours have faded. Touch a terminal and it shows its colour for a moment.', 'Remember what you saw, then connect colour to colour.'],
    [{ at: 'panel', lock: { kind: 'wires', colors: COLORS, right: [5, 3, 4, 0, 2, 1], hidden: true } }]),
  R(908, 'B', 'Five Dials', 'Five tokens, five dials, and the rim is worn.', ['The note has the legend.', 'Star, spade, spark, cross, moon: 5, 25, 15, 30, 35.'],
    [clue('shelf', { kind: 'symbols', order: [G.star, G.spade, G.spark, G.cross, G.moon] }), clue('note', { kind: 'symbols', legend: LEGEND8 }), { at: 'panel', lock: { kind: 'dials', combo: [5, 25, 15, 30, 35], steps: STEPS8 } }]),
  S(909, 'echo', 'The Gramophone', 'A gramophone hums six notes, too high to sing along.', ['Play the same notes on the piano, an octave lower.', 'On the lowest keys: E G B A F D.']),
  R(910, 'B', 'The Door Itself', 'The panel holds a picture of the door, cut up.', ['Slide.', 'Corners first, then edges.'],
    [{ at: 'panel', lock: { kind: 'slide', region: { x: 0, y: 20, w: 100, h: 60 }, seed: 910 }, label: 'Panel' }]),
];

// ---------------- Floor 10: the rooftop, everything at once ----------------
const F10 = [
  R(1001, 'A', 'The Ledger', 'A riddle on the note. Numbers all the way down.', ['Floors and rooms.', 'Ten floors, ten rooms each, one hundred doors: 1010100.'],
    [clue('note', { kind: 'math', lines: ['The floors of this hotel,', 'the rooms on each,', 'the doors in all.'], caption: 'Three numbers, in a row.' }), keypad('1010100')]),
  R(1002, 'A', 'Mirrored Marks', 'Marks in the frame, mirrored. Legend on the note.', ['A mirror reverses the order.', 'Star, sun, lily, moon, spark: 05 20 00 35 15.'],
    [clue('frame', { kind: 'symbols', order: [G.spark, G.moon, G.lily, G.sun, G.star], caption: 'Seen in a mirror.', title: 'The picture, reflected' }), clue('note', { kind: 'symbols', legend: LEGEND8, caption: 'Two digits per mark.' }), keypad('0520003515')]),
  R(1003, 'A', 'Last Signal', 'The sconce flickers, five figures.', ['The chart hangs in the frame.', '4, 4, 9, 2, 6.'],
    [clue('sconce', { kind: 'morselamp', code: '44926' }), clue('frame', { kind: 'morse', table: MORSE_TABLE }), keypad('44926')]),
  S(1004, 'darkroom', 'Lights Out', 'Pitch black. A torch with a tired battery.', ['Press and hold to shine the torch. Four marks are hidden on the walls.', 'I 5, II 2, III 7, IV 1: 5271.']),
  R(1005, 'A', 'Eight Studs', 'A shape that covers almost the whole grid.', ['One stroke.', 'Centre, top-middle, top-right, middle-right, bottom-right, bottom-middle, bottom-left, middle-left.'],
    [clue('note', { kind: 'shape', path: [4, 1, 2, 5, 8, 7, 6, 3] }), { at: 'keypad', lock: { kind: 'pattern', path: [4, 1, 2, 5, 8, 7, 6, 3] }, label: 'Panel' }]),
  R(1006, 'B', 'Seven Flashes', 'The lever. Seven flashes, nine seconds.', ['Watch, then go.', 'Third, first, fourth, second, fourth, first, third.'],
    [{ at: 'panel', lock: { kind: 'timed', order: [2, 0, 3, 1, 3, 0, 2], limit: 9000 }, label: 'Lever' }]),
  R(1007, 'B', 'Three Rounds, Eight', 'Five, seven, eight.', ['The last round is eight flashes.', 'Second, third, first, fourth, third, second, fourth, first.'],
    [{ at: 'panel', lock: { kind: 'memory', seq: [1, 2, 0, 3, 2, 1, 3, 0], rounds: [5, 7, 8] } }]),
  S(1008, 'twoHands', 'Two Hands', 'A steel door, a bolt as thick as an arm, and two brass hand-plates.', ['Both plates must be held at once. Then the bolt moves.', 'Two fingers on the plates, a third slides the bolt. On a keyboard: A and L.']),
  R(1009, 'B', 'Twenty-five', 'The heaviest box in the hotel.', ['Twenty-five from six weights.', 'IV, VIII and XIII.'],
    [clue('shelf', { kind: 'weights', weights: [4, 6, 8, 9, 13, 20], target: 25 }), { at: 'panel', lock: { kind: 'scale', weights: [4, 6, 8, 9, 13, 20], target: 25, roman: ROMAN } }]),
  R(1010, 'B', 'The Roof', 'The last door. The panel is dead until the fuse is in.', ['The fuse is on the shelf. Then the lamps will tell you the code, and the note will tell you the order.', 'Fuse in the panel. Lamps flash first, third, second, fourth, second, first, fourth, third, in three rounds.'],
    [item('shelf', 'fuse', 'A glass fuse, still good.'), { at: 'panel', lock: { kind: 'memory', seq: [0, 2, 1, 3, 1, 0, 3, 2], rounds: [4, 6, 8] }, requires: 'fuse', flavor: 'Dead. An empty fuse slot.', label: 'Panel' }, clue('note', { kind: 'text', lines: ['Power first.', 'Then remember everything.'] })]),
];

const ALL = { 3: F3, 4: F4, 5: F5, 6: F6, 7: F7, 8: F8, 9: F9, 10: F10 };

export const GENERATED_LEVELS = Object.entries(ALL).flatMap(([f, rooms]) => rooms.map((r, i) => ({
  floor: FLOOR_NAMES[f], id: r.id, title: r.title, image: `assets/rooms/${r.id}.webp`,
  door: { x: 30, y: 30, w: 40, h: 47 },
  intro: i === 0 ? FLOOR_INTRO[f] : r.intro,
  hints: r.hints,
  spec: r,
  mount: r.custom ? SPECIAL[r.custom] : (ctx) => mountRoom(ctx, { ...r, image: `assets/rooms/${r.id}.webp` }),
})));
