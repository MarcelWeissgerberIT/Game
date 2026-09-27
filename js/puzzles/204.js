// Room 204 – The Ledger. The code is assembled from details of rooms on the floor below.
export default function mount(ctx) {
  const { hotspot, showCard, showKeypad, toast, solve } = ctx;
  const CODE = '4349'; // lamps above 105, dials in 106, wires in 110, hour on the clock in 102

  hotspot({ x: 30, y: 30, w: 40, h: 47, label: 'Door', onTap: () => toast('Locked.') });

  hotspot({ x: 3, y: 46, w: 22, h: 18, label: 'Directory', onTap: () => {
    showCard(`<h2>Directory</h2><div style="background:#0a0a0a;border:3px solid #d9a441;border-radius:4px;padding:14px;font-family:Georgia;letter-spacing:.1em;color:#f2e6c8;line-height:1.9">
      <div style="text-align:center;color:#f3c96b;font-size:12px;letter-spacing:.3em">FLOOR ONE</div>
      101 The Key<br>102 The Clock<br>103 The Mirror<br>104 The Labyrinth<br>105 The Sconces<br>106 The Vault<br>107 The Chandelier<br>108 The Switchboard<br>109 The Wallpaper<br>110 The Elevator
      <div style="text-align:center;font-size:11px;opacity:.7;margin-top:8px">Guests may revisit opened rooms from the lobby.</div></div>`);
  } });

  hotspot({ x: 44, y: 77, w: 15, h: 9, label: 'Note', onTap: () => {
    showCard(`<h2>A folded note</h2><div class="note"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.2em">HOUSEKEEPING TALLY</p>
      <p style="margin:4px 0">the lamps above the doors of 105</p><p style="margin:4px 0">the dials of the vault in 106</p><p style="margin:4px 0">the wires behind the panel in 110</p><p style="margin:4px 0">the hour on the clock in 102</p>
      <p style="margin:10px 0 0;font-size:12px">in that order</p></div>`);
  } });

  hotspot({ x: 81, y: 48, w: 11, h: 12, label: 'Keypad', onTap: () => showKeypad({ code: CODE, title: 'Room 204', onSolve: solve }) });
}
