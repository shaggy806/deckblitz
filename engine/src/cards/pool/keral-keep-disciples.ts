import { defineCard } from "../define.js";

// Resolves before the loyalty ability that fired it (its ruling).
const TEXT =
  "Whenever you activate a loyalty ability of a Chandra planeswalker, this creature deals 1 damage to each opponent.";

export default defineCard({
  name: "Keral Keep Disciples",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "activates-ability",
        who: "you",
        loyalty: true,
        source: { type: "planeswalker", subtype: "Chandra" },
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
