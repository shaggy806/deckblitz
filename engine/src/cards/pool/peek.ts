import { defineCard } from "../define.js";

// EDHREC rank 4522.

export default defineCard({
  name: "Peek",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at target player's hand.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-at-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
