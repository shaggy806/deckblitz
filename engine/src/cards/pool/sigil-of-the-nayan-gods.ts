import { defineCard } from "../define.js";

// EDHREC rank 19583. Hope Against Hope's per-count bonus.
//
// Rulings:
//   Counts the creatures the Aura's controller controls, whoever controls the
//     enchanted creature.

const PUMP_TEXT = "Enchanted creature gets +1/+1 for each creature you control.";

export default defineCard({
  name: "Sigil of the Nayan Gods",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{G/W}" },
  text: `Enchant creature\n${PUMP_TEXT}\nCycling {G/W} ({G/W}, Discard this card: Draw a card.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "creature", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
