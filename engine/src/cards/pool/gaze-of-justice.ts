import { defineCard } from "../define.js";

export default defineCard({
  name: "Gaze of Justice",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, tap three untapped white creatures you control.\nExile target creature.\nFlashback {5}{W} (You may cast this card from your graveyard for its flashback cost and any additional costs. Then exile it.)",
  additionalCost: {
    also: {
      text: "Tap three untapped white creatures you control",
      tapUntapped: { filter: { type: "creature", colors: ["W"] }, count: 3 },
    },
  },
  flashback: { cost: "{5}{W}" },
  targets: ["creature"],
  effect: { kind: "exile", target: 0 },
});
