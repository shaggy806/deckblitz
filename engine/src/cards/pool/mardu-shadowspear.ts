import { defineCard } from "../define.js";

// EDHREC rank 13097. Fate Reforged.

export default defineCard({
  name: "Mardu Shadowspear",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  dash: { cost: "{1}{B}" },
  text: "Whenever this creature attacks, each opponent loses 1 life.\nDash {1}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever this creature attacks, each opponent loses 1 life.",
    },
  ],
});
