import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a kicked spell, scry 2.";

export default defineCard({
  name: "Merfolk Falconer",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
