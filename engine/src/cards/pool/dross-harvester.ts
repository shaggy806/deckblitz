import { defineCard } from "../define.js";

export default defineCard({
  name: "Dross Harvester",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: "Protection from white\nAt the beginning of your end step, you lose 4 life.\nWhenever a creature dies, you gain 2 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 4 },
      resolve: null,
      text: "At the beginning of your end step, you lose 4 life.",
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "Whenever a creature dies, you gain 2 life.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
