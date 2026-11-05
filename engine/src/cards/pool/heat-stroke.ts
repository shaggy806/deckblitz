import { defineCard } from "../define.js";

// `blockedThisTurn` keeps the turn's blocks, so a creature removed from combat still counts.

const TEXT = "At end of combat, destroy each creature that blocked or was blocked this turn.";

export default defineCard({
  name: "Heat Stroke",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", blockedThisTurn: { relation: "either" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
