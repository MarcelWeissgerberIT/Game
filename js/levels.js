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

export const LEVELS = [
  { id: 101, title: 'The Key', image: 'assets/rooms/101.webp', door: { x: 27, y: 27, w: 45, h: 50 },
    intro: 'Welcome to Hotel Nocturne. Every door is locked. Look around.',
    hints: ['Something is hiding in the greenery.', 'Tap the palm, pick up what falls, then tap the lock.'], mount: r101 },
  { id: 102, title: 'The Clock', image: 'assets/rooms/102.webp', door: { x: 30, y: 30, w: 40, h: 47 },
    intro: 'The keypad wants four digits.',
    hints: ['The clock stopped at a very specific moment.', 'Hours first, then minutes: 09 15.'], mount: r102 },
  { id: 103, title: 'The Mirror', image: 'assets/rooms/103.webp', door: { x: 32, y: 30, w: 38, h: 47 },
    intro: 'Steam from the baths has fogged the mirror.',
    hints: ['Wipe the mirror with your finger.', 'Someone wrote the code in the fog: 2847.'], mount: r103 },
  { id: 104, title: 'The Labyrinth', image: 'assets/rooms/104.webp', door: { x: 32, y: 40, w: 38, h: 37 },
    intro: 'The display panel beside the door is humming.',
    hints: ['Tilt your phone to roll the ball, or use the arrows.', 'Guide the ball to the glowing exit.'], mount: r104 },
  { id: 105, title: 'The Sconces', image: 'assets/rooms/105.webp', door: { x: 22, y: 25, w: 55, h: 52 },
    intro: 'Four lamps, all dark. A card on the floor.',
    hints: ['The card lists roman numerals.', 'Light the lamps in the order II, IV, I, III (counting from the left).'], mount: r105 },
  { id: 106, title: 'The Vault', image: 'assets/rooms/106.webp', door: { x: 32, y: 30, w: 38, h: 47 },
    intro: 'A vault door. The painting seems out of place.',
    hints: ['The painting shows roman numerals.', 'Set the dials to 20, 5 and 35.'], mount: r106 },
  { id: 107, title: 'The Chandelier', image: 'assets/rooms/107.webp', door: { x: 27, y: 30, w: 45, h: 47 },
    intro: 'Something glints high up in the chandelier.',
    hints: ['Shake your phone. On a computer, tap the chandelier repeatedly.', 'Pick up the key and use it on the lock.'], mount: r107 },
  { id: 108, title: 'The Switchboard', image: 'assets/rooms/108.webp', door: { x: 30, y: 32, w: 40, h: 45 },
    intro: 'The door opens only when all four lamps shine.',
    hints: ['Each switch toggles its own lamp and its neighbours.', 'Flip switches 2 and 3.'], mount: r108 },
  { id: 109, title: 'The Wallpaper', image: 'assets/rooms/109.webp', door: { x: 30, y: 32, w: 40, h: 45 },
    intro: 'The wallpaper pattern hides something.',
    hints: ['Take the magnifying glass and inspect the wall.', 'Read the digits left to right: 6031.'], mount: r109 },
  { id: 110, title: 'The Elevator', image: 'assets/rooms/110.webp', door: { x: 30, y: 32, w: 40, h: 45 },
    intro: 'The elevator is dead. The service panel is screwed shut.',
    hints: ['A screwdriver lies on the floor.', 'Connect each wire to the terminal of the same colour.'], mount: r110 },
];
