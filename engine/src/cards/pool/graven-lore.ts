import { defineCard } from "../define.js";

// EDHREC rank 12838.
//
// X is the mana from snow sources spent to cast it (rule 107.4h) — 0 cast
// without any, or as a copy (the rulings).
export default defineCard({
  name: "Graven Lore",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["instant"],
  text: "Scry X, where X is the amount of {S} spent to cast this spell, then draw three cards. ({S} is mana from a snow source.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "scry", amount: { manaSpentOf: "source", from: { supertype: "snow" } } },
      { kind: "draw", amount: 3 },
    ],
  },
});
