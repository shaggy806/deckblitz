import { defineCard } from "../define.js";

// EDHREC rank 29590. Fallen Empires.

const TEXT = "{5}, {T}: Discard a card at random, then draw two cards.";

export default defineCard({
  name: "Ring of Renewal",
  manaCost: "{5}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1, random: true },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
