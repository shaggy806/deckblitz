import { defineCard } from "../define.js";

// EDHREC rank 22708.
//
// Rulings:
//   [2008-08-01] This is a mana ability … (superseded: rule 605.1a now excludes an ability whose
//     effect moves a card from a library, so the draw puts this on the stack, as Chromatic
//     Sphere's does).

const TEXT = "{2}, {T}, Sacrifice this artifact: Add {B}{R}. Draw a card.";

export default defineCard({
  name: "Shadowblood Egg",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice this artifact: Add {B}{R}. Draw a card. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: { all: ["B", "R"] }, amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
