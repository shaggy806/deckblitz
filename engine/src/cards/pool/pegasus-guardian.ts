import { defineCard } from "../define.js";

// The end-step trigger counts a permanent that left while Pegasus Guardian
// wasn't yet under your control too (its ruling) — a turn-history read.
export default defineCard({
  name: "Pegasus Guardian",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your end step, if a permanent you controlled left the battlefield this turn, create a 1/1 white Pegasus creature token with flying.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Pegasus Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if a permanent you controlled left the battlefield this turn, create a 1/1 white Pegasus creature token with flying.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
  faces: ["Pegasus Guardian", "Rescue the Foal"],
  adventure: true,
});
