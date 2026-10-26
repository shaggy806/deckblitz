import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 16115.
//
// Rulings:
//   [2006-02-01] Unlike many similar cards, Drowned Rusalka's ability causes you to discard a card
//     first and then draw a card. If your hand is empty, you will just draw a card.

export default defineCard({
  name: "Drowned Rusalka",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: "{U}, Sacrifice a creature: Discard a card, then draw a card.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{U}, Sacrifice a creature: Discard a card, then draw a card.",
    },
  ],
});
