import { defineCard } from "../define.js";

// EDHREC rank 29412. "Target player reveals the top card of their library":
// `reveal-top` of the player in slot 0 (a player target is its own owner),
// with nothing done after.

const REVEAL_TEXT = "{1}{U}: Target player reveals the top card of their library.";

export default defineCard({
  name: "Aven Windreader",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${REVEAL_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["player"],
      effect: { kind: "reveal-top", of: { ownerOfTarget: 0 }, then: { kind: "sequence", effects: [] } },
      resolve: null,
      text: REVEAL_TEXT,
    },
  ],
});
