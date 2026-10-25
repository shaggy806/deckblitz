import { defineCard } from "../define.js";

// EDHREC rank 25322. Alliances. Soul Net's shape; it triggers on a creature
// that dies at the same time as Inheritance (the ruling — a leaves-the-
// battlefield trigger looks back).

export default defineCard({
  name: "Inheritance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a creature dies, you may pay {3}. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {3} to draw a card?", cost: "{3}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever a creature dies, you may pay {3}. If you do, draw a card.",
    },
  ],
});
