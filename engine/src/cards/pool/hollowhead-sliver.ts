import { defineCard } from "../define.js";

const TEXT = 'Sliver creatures you control have "{T}, Discard a card: Draw a card."';

export default defineCard({
  name: "Hollowhead Sliver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, discard: { count: 1 } },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{T}, Discard a card: Draw a card.",
        },
      ],
      text: TEXT,
    },
  ],
});
