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
      { kind: "prohibit", target: 0, regeneration: true },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
