import { defineCard } from "../define.js";

export default defineCard({
  name: "Siren of the Silent Song",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Siren"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nInspired — Whenever this creature becomes untapped, each opponent discards a card, then each opponent mills a card.",
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "mill", target: "each-opponent", amount: 1 },
        ],
      },
      resolve: null,
      text: "Inspired — Whenever this creature becomes untapped, each opponent discards a card, then each opponent mills a card.",
    },
  ],
});
