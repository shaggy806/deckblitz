import { defineCard } from "../define.js";

// Aether Revolt.
const ENTER_TEXT = "When this creature enters, you gain 3 life and get {E}{E}{E} (three energy counters).";

export default defineCard({
  name: "Reservoir Walker",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "get-energy", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
