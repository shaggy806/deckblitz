import { defineCard } from "../define.js";

// EDHREC rank 9320. Bloomburrow.
//
// Torbran's "that much damage plus N", on damage to anything, from a Lizard,
// Mouse, Otter or Raccoon its controller controls. Beside another damage
// modifier the order is the recipient's, worked out as the one best for them
// (rule 616.1, `bestDamageOrder`); all of it prevented, nothing is added; a
// divided or assigned amount is split first and each share gets +1 (the
// rulings).
const TEXT =
  "If a Lizard, Mouse, Otter, or Raccoon you control would deal damage to a permanent or player, it deals that much damage plus 1 instead.";

export default defineCard({
  name: "Valley Flamecaller",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: 1,
        source: { subtypes: ["Lizard", "Mouse", "Otter", "Raccoon"], controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
