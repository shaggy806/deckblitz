import { defineCard } from "../define.js";

const CYCLE_TEXT = "When you cycle this card, you may have it deal 2 damage to target creature.";

export default defineCard({
  name: "Deem Worthy",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Deem Worthy deals 7 damage to target creature.\nCycling {3}{R} ({3}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["creature"],
  effect: { kind: "damage", amount: 7, target: 0 },
  cycling: { cost: "{3}{R}" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Deem Worthy deal 2 damage to the target creature?",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
