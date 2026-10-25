import { defineCard } from "../define.js";

// EDHREC rank 16355.
//
// Counted as the trigger resolves, this creature included if it's still
// there (the ruling).
const TEXT = "When this creature enters, you gain 1 life for each creature you control.";

export default defineCard({
  name: "Angel of Renewal",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Ally"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
