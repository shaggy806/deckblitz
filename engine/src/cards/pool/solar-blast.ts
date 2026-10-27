import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 24697. Deem Worthy's cycling trigger, on any
// target: the trigger goes on the stack above the cycling draw (rulings).

const CYCLE_TEXT = "When you cycle this card, you may have it deal 1 damage to any target.";

export default defineCard({
  name: "Solar Blast",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  cycling: { cost: "{1}{R}{R}" },
  text: `Solar Blast deals 3 damage to any target.\nCycling {1}{R}{R} ({1}{R}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Have Solar Blast deal 1 damage to the target?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
