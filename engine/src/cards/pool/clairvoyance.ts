import { defineCard } from "../define.js";

// EDHREC rank 17433.

export default defineCard({
  name: "Clairvoyance",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at target player's hand.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-at-hand", target: 0 },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
