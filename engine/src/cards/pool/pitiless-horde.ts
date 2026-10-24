import { defineCard } from "../define.js";

// EDHREC rank 23279.

export default defineCard({
  name: "Pitiless Horde",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Berserker"],
  power: 5,
  toughness: 3,
  dash: { cost: "{2}{B}{B}" },
  text: "At the beginning of your upkeep, you lose 2 life.\nDash {2}{B}{B} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 2 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 2 life.",
    },
  ],
});
