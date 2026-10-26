import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, you may put a charge counter on this artifact.";
const SAC = "{T}, Sacrifice this artifact: You gain life equal to the number of charge counters on this artifact.";

// The counters are read from its last existence on the battlefield (the
// ruling) — Shrine of Burning Rage's shape.
export default defineCard({
  name: "Golden Urn",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP}\n${SAC}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a charge counter on Golden Urn?",
        effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countersOn: "source", counter: "charge" } },
      resolve: null,
      text: SAC,
    },
  ],
});
