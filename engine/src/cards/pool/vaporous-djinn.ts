import { defineCard } from "../define.js";

export default defineCard({
  name: "Vaporous Djinn",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, this creature phases out unless you pay {U}{U}. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{U}{U}", text: "Pay {U}{U}." }],
        otherwise: { kind: "phase-out", target: "source" },
      },
      resolve: null,
      text: "At the beginning of your upkeep, this creature phases out unless you pay {U}{U}.",
    },
  ],
});
