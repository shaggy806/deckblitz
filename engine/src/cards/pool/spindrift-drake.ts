import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 31550. Earthlink's upkeep shape.

const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {U}.";

export default defineCard({
  name: "Spindrift Drake",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{U}", text: "Pay {U}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
