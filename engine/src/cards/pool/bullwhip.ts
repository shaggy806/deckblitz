import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 25629.
//
// Rulings:
//   [2004-10-04] If the creature can attack, it must. If it cannot, then nothing happens.

const TEXT = "{2}, {T}: This artifact deals 1 damage to target creature. That creature attacks this turn if able.";

export default defineCard({
  name: "Bullwhip",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "restrict", target: 0, restrictions: ["must-attack"] },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
