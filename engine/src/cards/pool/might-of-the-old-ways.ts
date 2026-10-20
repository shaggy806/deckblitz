import { defineCard } from "../define.js";

// EDHREC rank 23819.
//
// Rulings:
//   [2021-09-24] The effects of Might of the Old Ways happen in the listed order, so the +2/+2
//     bonus happens before you check the powers of creatures you control.
//
// Coven is checked as the draw step comes, after the pump has applied.

export default defineCard({
  name: "Might of the Old Ways",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.\nCoven — Then if you control three or more creatures with different powers, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "conditional", condition: { kind: "coven" }, then: { kind: "draw", amount: 1 } },
    ],
  },
});
