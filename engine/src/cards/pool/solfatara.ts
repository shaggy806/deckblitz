import { defineCard } from "../define.js";

// EDHREC rank 29103.

export default defineCard({
  name: "Solfatara",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target player can't play lands this turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prohibit", prohibits: [{ act: "play-land", who: { target: 0 } }] },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
