import { defineCard } from "../define.js";

// Portal. EDHREC rank 31947.
const TEXT = "When this creature enters, sacrifice a land.";

export default defineCard({
  name: "Foul Spirit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
