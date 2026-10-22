import { defineCard } from "../define.js";

// EDHREC rank 18701. Fallen Empires.
//
// Rulings:
//   [2004-10-04] You draw two cards, then put one back as part of the same effect. You can't do
//     anything in between.

const TEXT = "{1}, {T}, Sacrifice this artifact: Draw two cards, then put a card from your hand on top of your library.";

export default defineCard({
  name: "Conch Horn",
  manaCost: "{2}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
