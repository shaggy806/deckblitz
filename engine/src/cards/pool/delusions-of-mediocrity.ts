import { defineCard } from "../define.js";

export default defineCard({
  name: "Delusions of Mediocrity",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "When this enchantment enters, you gain 10 life.\nWhen this enchantment leaves the battlefield, you lose 10 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 10 },
      resolve: null,
      text: "When this enchantment enters, you gain 10 life.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 10 },
      resolve: null,
      text: "When this enchantment leaves the battlefield, you lose 10 life.",
    },
  ],
});
