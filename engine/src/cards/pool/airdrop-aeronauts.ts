import { defineCard } from "../define.js";

// EDHREC rank 26816.

export default defineCard({
  name: "Airdrop Aeronauts",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Scout"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nRevolt — When this creature enters, if a permanent left the battlefield under your control this turn, you gain 5 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 5 },
      resolve: null,
      text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, you gain 5 life.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
