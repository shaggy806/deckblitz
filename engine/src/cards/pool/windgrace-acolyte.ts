import { defineCard } from "../define.js";

// EDHREC rank 27267. Dominaria.

const TEXT = "When this creature enters, mill three cards and you gain 3 life.";

export default defineCard({
  name: "Windgrace Acolyte",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
