import { defineCard } from "../define.js";

// Rulings:
//   [2012-05-01] Whether you control an Angel is checked when the ability resolves.

export default defineCard({
  name: "Scroll of Avacyn",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}, Sacrifice this artifact: Draw a card. If you control an Angel, you gain 5 life.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Angel" }, atLeast: 1 },
            then: { kind: "gain-life", amount: 5 },
          },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice this artifact: Draw a card. If you control an Angel, you gain 5 life.",
    },
  ],
});
