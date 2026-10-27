import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 31131.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {2}.";

export default defineCard({
  name: "Molting Harpy",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Harpy", "Mercenary"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
