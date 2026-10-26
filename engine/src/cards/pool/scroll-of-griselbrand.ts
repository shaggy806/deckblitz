import { defineCard } from "../define.js";

// EDHREC rank 26835.
//
// Rulings:
//   [2012-05-01] Whether you control a Demon is checked when the ability resolves.

const TEXT =
  "{1}, Sacrifice this artifact: Target opponent discards a card. If you control a Demon, that player loses 3 life.";

export default defineCard({
  name: "Scroll of Griselbrand",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: 0, amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 1 },
            then: { kind: "lose-life", amount: 3, target: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
