import { defineCard } from "../define.js";

// EDHREC rank 3849.
//
// Rulings:
//   [2024-07-26] If the target creature is an illegal target as Might of the Meek tries to
//     resolve, it won’t resolve and none of its effects will happen. You won’t draw a card.

export default defineCard({
  name: "Might of the Meek",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gains trample until end of turn. It also gets +1/+0 until end of turn if you control a Mouse.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Mouse" }, atLeast: 1 },
        then: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
