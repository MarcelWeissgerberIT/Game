// Every room: artwork, door rectangle (percent of the artwork), hints and its puzzle module.
import r101 from './puzzles/101.js';
import r102 from './puzzles/102.js';
import r103 from './puzzles/103.js';
import r104 from './puzzles/104.js';
import r105 from './puzzles/105.js';
import r106 from './puzzles/106.js';
import r107 from './puzzles/107.js';
import r108 from './puzzles/108.js';
import r109 from './puzzles/109.js';
import r110 from './puzzles/110.js';
import r201 from './puzzles/201.js';
import r202 from './puzzles/202.js';
import r203 from './puzzles/203.js';
import r204 from './puzzles/204.js';
import r205 from './puzzles/205.js';
import r206 from './puzzles/206.js';
import r207 from './puzzles/207.js';
import r208 from './puzzles/208.js';
import r209 from './puzzles/209.js';
import r210 from './puzzles/210.js';
import { GENERATED_LEVELS } from './floors.js';

export const LEVELS = [
  { floor: 'Floor One', id: 101, title: 'The Key', image: 'assets/rooms/101.webp', door: { x: 27, y: 27, w: 45, h: 50 },
    intro: 'Welcome to Hotel Nocturne. Every door is locked. Look around.',
    hints: ['Something is hiding in the greenery.', 'Tap the palm, pick up what falls, then tap the lock.'], mount: r101 },
  { floor: 'Floor One', id: 102, title: 'The Clock', image: 'assets/rooms/102.webp', door: { x: 30, y: 30, w: 40, h: 47 },
    intro: 'A clock, a keypad, and silence.',
    hints: ['Mirrors reverse everything, even time.', 'Read the clock as it really stands: 09:15.'], mount: r102 },
  { floor: 'Floor One', id: 103, title: 'The Mirror', image: 'assets/rooms/103.webp', door: { x: 32, y: 30, w: 38, h: 47 },
    intro: 'Steam from the baths has fogged the mirror.',
    hints: ['Wipe the glass. The writing is backwards, as if written from inside.', 'Flip it in your head: 2847.'], mount: r103 },
  { floor: 'Floor One', id: 104, title: 'The Labyrinth', image: 'assets/rooms/104.webp', door: { x: 32, y: 40, w: 38, h: 37 },
    intro: 'The corridor hums. Static in the air.',
    hints: ['The dark panel is not decoration.', 'Tilt your phone, or use the arrows, to roll the ball to the glowing exit.'], mount: r104 },
  { floor: 'Floor One', id: 105, title: 'The Sconces', image: 'assets/rooms/105.webp', door: { x: 22, y: 25, w: 55, h: 52 },
    intro: 'The lamps went out long ago.',
    hints: ['The card lists roman numerals.', 'Light the lamps in the order II, IV, I, III (counting from the left).'], mount: r105 },
  { floor: 'Floor One', id: 106, title: 'The Vault', image: 'assets/rooms/106.webp', door: { x: 32, y: 30, w: 38, h: 47 },
    intro: 'Steel where a door should be.',
    hints: ['The painting gives an order, the steel gives the numbers.', 'Sun, star, moon: 20, 5, 35.'], mount: r106 },
  { floor: 'Floor One', id: 107, title: 'The Chandelier', image: 'assets/rooms/107.webp', door: { x: 27, y: 30, w: 45, h: 47 },
    intro: 'The chandelier sways, although there is no draft.',
    hints: ['Something is caught up in the crystal. Shake it loose.', 'Shake your phone, or tap the chandelier repeatedly, then use what falls.'], mount: r107 },
  { floor: 'Floor One', id: 108, title: 'The Switchboard', image: 'assets/rooms/108.webp', door: { x: 30, y: 32, w: 40, h: 45 },
    intro: 'Old wiring crackles behind the wall.',
    hints: ['Each switch toggles its own lamp and its neighbours.', 'Flip switches 2 and 3.'], mount: r108 },
  { floor: 'Floor One', id: 109, title: 'The Wallpaper', image: 'assets/rooms/109.webp', door: { x: 30, y: 32, w: 40, h: 45 },
    intro: 'The wallpaper seems to shimmer.',
    hints: ['The glass on the table shows more than the eye. The marquee shows an order.', 'Match the glyphs: 6031.'], mount: r109 },
  { floor: 'Floor One', id: 110, title: 'The Elevator', image: 'assets/rooms/110.webp', door: { x: 30, y: 32, w: 40, h: 45 },
    intro: 'The end of the corridor. An elevator.',
    hints: ['Something on the floor might open the panel.', 'Connect each wire to the terminal of the same colour.'], mount: r110 },
  { floor: 'Floor Two', id: 201, title: 'The Signal', image: 'assets/rooms/201.webp', door: { x: 30, y: 23, w: 40, h: 54 },
    intro: 'Quieter up here. A lamp flickers in a rhythm.',
    hints: ['The flicker is not random. The chart on the wall speaks the same language.', 'Short and long: 7, 2, 5.'], mount: r201 },
  { floor: 'Floor Two', id: 202, title: 'The Painting', image: 'assets/rooms/202.webp', door: { x: 68, y: 26, w: 24, h: 51 },
    intro: 'Someone has cut the painting into pieces.',
    hints: ['Slide the pieces into the gap until the sunrise is whole.', 'The artist signed with numbers in the corner: 4172.'], mount: r202 },
  { floor: 'Floor Two', id: 203, title: 'The Plaque', image: 'assets/rooms/203.webp', door: { x: 27, y: 20, w: 48, h: 57 },
    intro: 'A plaque hangs the wrong way round.',
    hints: ['If the plaque will not turn, turn yourself. Or your phone.', 'Nine, six, one, eight.'], mount: r203 },
  { floor: 'Floor Two', id: 204, title: 'The Tally', image: 'assets/rooms/204.webp', door: { x: 30, y: 30, w: 40, h: 47 },
    intro: 'A note on the floor. A directory of the floor below.',
    hints: ['Count what the note asks for. You may revisit the rooms downstairs from the lobby.', 'Four lamps, three dials, four wires, nine o\'clock: 4349.'], mount: r204 },
  { floor: 'Floor Two', id: 205, title: 'The Lever', image: 'assets/rooms/205.webp', door: { x: 27, y: 30, w: 46, h: 47 },
    intro: 'Five sunbursts and a lever. The bolts are heavy.',
    hints: ['Pull the lever and watch the order the medallions light up.', 'Repeat the order fast: the third, first, fifth, second, then fourth medallion.'], mount: r205 },
  { floor: 'Floor Two', id: 206, title: 'The Piano', image: 'assets/rooms/206.webp', door: { x: 33, y: 30, w: 34, h: 27 },
    intro: 'A piano blocks the way. The sheet is not blank after all.',
    hints: ['Read the sheet, then find the notes. C sits left of the pair of black keys.', 'G, E, C, D, G.'], mount: r206 },
  { floor: 'Floor Two', id: 207, title: 'The Scale', image: 'assets/rooms/207.webp', door: { x: 32, y: 40, w: 36, h: 37 },
    intro: 'A balance, a sealed box, a shelf of weights.',
    hints: ['The box is marked. Match its weight with what is on the shelf.', 'Twelve: for instance III and IX.'], mount: r207 },
  { floor: 'Floor Two', id: 208, title: 'The Cipher', image: 'assets/rooms/208.webp', door: { x: 32, y: 30, w: 38, h: 47 },
    intro: 'A wheel of letters and numbers. Someone scratched a note into the sign.',
    hints: ['Turn the inner ring until E sits under 9, then read the four letters as numbers.', 'B H A F becomes 6250.'], mount: r208 },
  { floor: 'Floor Two', id: 209, title: 'The Memory', image: 'assets/rooms/209.webp', door: { x: 32, y: 30, w: 38, h: 47 },
    intro: 'Four lamps and a button. The lamps remember.',
    hints: ['Press the button, watch, repeat. It gets longer each time.', 'Second, fourth, first, third, third, second.'], mount: r209 },
  { floor: 'Floor Two', id: 210, title: 'The Fuse', image: 'assets/rooms/210.webp', door: { x: 30, y: 42, w: 40, h: 35 },
    intro: 'The elevator again. Dead again.',
    hints: ['Power first. Check the drawers.', 'Two plus one plus zero: send the cab to the third floor.'], mount: r210 },
  ...GENERATED_LEVELS,
];
