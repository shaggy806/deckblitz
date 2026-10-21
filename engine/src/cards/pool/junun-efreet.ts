import { defineCard } from "../define.js";

// EDHREC rank 32098.

export default defineCard({
  name: "Junún Efreet",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, sacrifice this creature unless you pay {B}{B}.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{B}{B}", text: "Pay {B}{B}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice this creature unless you pay {B}{B}.",
    },
  ],
});
