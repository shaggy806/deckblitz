import { defineCard } from "../define.js";

// EDHREC rank 13282.
//
// Rulings:
//   [2008-05-01] An effect that changes a permanent's colors overwrites all its old colors unless
//     it specifically says "in addition to its other colors."

export default defineCard({
  name: "Viridescent Wisps",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature becomes green and gets +1/+0 until end of turn.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become-color", target: 0, colors: ["G"], duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
