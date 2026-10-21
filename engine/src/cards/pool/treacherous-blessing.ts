import { defineCard } from "../define.js";

// Theros Beyond Death.

export default defineCard({
  name: "Treacherous Blessing",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, draw three cards.\nWhenever you cast a spell, you lose 1 life.\nWhen this enchantment becomes the target of a spell or ability, sacrifice it.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: "When this enchantment enters, draw three cards.",
    },
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "you" },
      resolve: null,
      text: "Whenever you cast a spell, you lose 1 life.",
    },
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When this enchantment becomes the target of a spell or ability, sacrifice it.",
    },
  ],
});
