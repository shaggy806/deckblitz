import { defineCard } from "../define.js";

// The mode is chosen as the ability triggers (its ruling) — `announced`.
const TRIGGER = "At the beginning of your upkeep, choose one —";
const GAIN = "You gain 2 life.";
const SURVEIL = "Surveil 1. (Look at the top card of your library. You may put that card into your graveyard.)";
const DRAIN = "Each opponent loses 1 life.";

export default defineCard({
  name: "Etherwrought Page",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact"],
  text: `${TRIGGER}\n• ${GAIN}\n• ${SURVEIL}\n• ${DRAIN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: GAIN, targets: [], effect: { kind: "gain-life", amount: 2 } },
          { text: SURVEIL, targets: [], effect: { kind: "surveil", amount: 1 } },
          { text: DRAIN, targets: [], effect: { kind: "lose-life", amount: 1, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: `${TRIGGER} ${GAIN} ${SURVEIL} ${DRAIN}`,
    },
  ],
});
