import { defineCard } from "../define.js";

export default defineCard({
  name: "Drifter il-Dal",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nAt the beginning of your upkeep, sacrifice this creature unless you pay {U}.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{U}", text: "Pay {U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you pay {U}.",
    },
  ],
});
