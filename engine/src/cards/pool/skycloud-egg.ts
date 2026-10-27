import { defineCard } from "../define.js";

// EDHREC rank 20880.
//
// Rulings:
//   [2008-08-01] This is a mana ability … (superseded: rule 605.1a now excludes an ability whose
//     effect moves a card from a library, so the draw puts this on the stack, as Chromatic
//     Sphere's does).

const TEXT = "{2}, {T}, Sacrifice this artifact: Add {W}{U}. Draw a card.";

export default defineCard({
  name: "Skycloud Egg",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice this artifact: Add {W}{U}. Draw a card. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: { all: ["W", "U"] }, amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
