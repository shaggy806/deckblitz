import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 31444.
const TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {U}.";

export default defineCard({
  name: "Phantasmal Forces",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 4,
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
