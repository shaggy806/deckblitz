import { defineCard } from "../define.js";

// EDHREC rank 14079.

const TEXT = "At the beginning of your upkeep, this creature deals 2 damage to each other creature you control.";

export default defineCard({
  name: "Cinder Giant",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", controlledBy: "you" },
        exceptSource: true,
        amount: 2,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
