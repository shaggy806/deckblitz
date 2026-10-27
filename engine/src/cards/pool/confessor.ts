import { defineCard } from "../define.js";

// EDHREC rank 18637.

const TEXT = "Whenever a player discards a card, you may gain 1 life.";

export default defineCard({
  name: "Confessor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "any", perCard: true },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
