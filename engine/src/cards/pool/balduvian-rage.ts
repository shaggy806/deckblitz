import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 9629.
//
// Rulings:
//   [2020-08-07] If the target creature is an illegal target by the time Balduvian Rage tries to
//     resolve, the spell won't resolve. You won't draw a card next turn.

export default defineCard({
  name: "Balduvian Rage",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target attacking creature gets +X/+0 until end of turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
