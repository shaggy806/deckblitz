import { defineCard } from "../define.js";

// EDHREC rank 13950.
//
// Rulings:
//   [2021-09-24] Only the +1/+1 counter is contingent on having three or more creatures with
//     different powers. The target creatures will still fight even if you don't.
//   [2021-09-24] If the target creature you control is still legal but the target creature you
//     don't control isn't, you will still put a +1/+1 counter on the creature you control.
//
// Coven here is a condition checked as the spell resolves, not an intervening
// if (Malamet Battle Glyph's shape). "A creature you don't control" is a
// creature an opponent controls.

export default defineCard({
  name: "Duel for Dominance",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Coven — Choose target creature you control and target creature you don't control. If you control three or more creatures with different powers, put a +1/+1 counter on the chosen creature you control. Then the chosen creatures fight each other. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "coven" },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
