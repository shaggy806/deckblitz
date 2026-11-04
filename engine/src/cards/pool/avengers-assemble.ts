import { defineCard } from "../define.js";

export default defineCard({
  name: "Avengers Assemble!",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: "Flash\nHeroes you control get +2/+2.\nAt the beginning of each end step, if you attacked with a Hero this turn or a Hero entered the battlefield under your control this turn, draw a card.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Hero", controlledBy: "you" } },
      grantPt: [2, 2],
      text: "Heroes you control get +2/+2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "any",
        of: [
          { kind: "turn-history", what: "attackers", filter: { subtype: "Hero" } },
          { kind: "turn-history", what: "entered", filter: { subtype: "Hero" } },
        ],
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "At the beginning of each end step, if you attacked with a Hero this turn or a Hero entered the battlefield under your control this turn, draw a card.",
    },
  ],
});
