import { defineCard } from "../define.js";

// EDHREC rank 9906. Morningtide.
//
// Rulings:
//   [2008-04-01] A spell you cast that’s both creature types costs {1} less to cast, not {2} less.
//   [2008-04-01] The effect reduces the total cost of the spell, regardless of whether you chose
//     to pay additional or alternative costs.
//
// Frogtosser Banneret's shape: one reduction over either type (`anyOf`), so a
// Treefolk Shaman spell gets {1} off, not {2} (the first ruling).
const COST_TEXT = "Treefolk spells and Shaman spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Bosk Banneret",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 1,
  toughness: 3,
  text: COST_TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { anyOf: [{ subtype: "Treefolk" }, { subtype: "Shaman" }] },
        caster: "you",
        reduceGeneric: 1,
      },
      text: COST_TEXT,
    },
  ],
});
