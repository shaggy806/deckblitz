import { defineCard } from "../define.js";

// EDHREC rank 12640.
//
// Rulings:
//   [2004-10-04] The ability applies to your opponent's spells as well as your own.

const TEXT = "Creature spells can't be countered.";

export default defineCard({
  name: "Gaea's Herald",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, cantBeCountered: true, allSpells: true },
      text: TEXT,
    },
  ],
});
