import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31890.

export default defineCard({
  name: "Merfolk Seer",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature dies, you may pay {1}{U}. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1}{U} to draw a card?", cost: "{1}{U}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "When this creature dies, you may pay {1}{U}. If you do, draw a card.",
    },
  ],
});
