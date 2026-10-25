import { defineCard } from "../define.js";

export default defineCard({
  name: "Insidious Bookworms",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, you may pay {1}{B}. If you do, target player discards a card at random.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Pay {1}{B} to have that player discard a card at random?",
        cost: "{1}{B}",
        effect: { kind: "discard", target: 0, amount: 1, random: true },
      },
      resolve: null,
      text: "When this creature dies, you may pay {1}{B}. If you do, target player discards a card at random.",
    },
  ],
});
