import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 30439.

export default defineCard({
  name: "Troublesome Spirit",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your end step, tap all lands you control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "land", controlledBy: "you" } },
      resolve: null,
      text: "At the beginning of your end step, tap all lands you control.",
    },
  ],
});
