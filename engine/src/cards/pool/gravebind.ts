import { defineCard } from "../define.js";

// EDHREC rank 25626.

export default defineCard({
  name: "Gravebind",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature can't be regenerated this turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "cant-regenerate", target: 0 },
      {
        kind: "delayed-trigger",
        at: { step: "upkeep" },
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
