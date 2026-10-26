import { defineCard } from "../define.js";

// EDHREC rank 28627.

export default defineCard({
  name: "Crystal Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: "At the beginning of your end step, this creature phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: "At the beginning of your end step, this creature phases out.",
    },
  ],
});
