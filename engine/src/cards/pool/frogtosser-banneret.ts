import { defineCard } from "../define.js";

// EDHREC rank 6980.
//
// Rulings:
//   [2008-04-01] A spell you cast that’s both creature types costs {1} less to cast, not {2} less.
//   [2008-04-01] The effect reduces the total cost of the spell, regardless of whether you chose
//     to pay additional or alternative costs. For example, if you cast a Rogue spell by paying its
//     prowl cost, Frogtosser Banneret causes that spell to cost {1} less.
//
// One reduction over either type (`anyOf`), so a Goblin Rogue spell gets {1}
// off, not {2} (the first ruling).
const COST_TEXT = "Goblin spells and Rogue spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Frogtosser Banneret",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { anyOf: [{ subtype: "Goblin" }, { subtype: "Rogue" }] },
        caster: "you",
        reduceGeneric: 1,
      },
      text: COST_TEXT,
    },
  ],
});
