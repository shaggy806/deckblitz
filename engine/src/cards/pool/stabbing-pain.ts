import { defineCard } from "../define.js";

// EDHREC rank 29565. Magic 2011.
//
// Rulings:
//   [2010-08-15] You may target any creature with Stabbing Pain. It's okay if it's already tapped.

export default defineCard({
  name: "Stabbing Pain",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -1/-1 until end of turn. Tap that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      { kind: "tap", target: 0 },
    ],
  },
});
