import { defineCard } from "../define.js";

// EDHREC rank 22240.
//
// Rulings:
//   [2019-10-04] If the creature you control is an illegal target as Joust tries to resolve, no
//     creature gets +2/+1. If that creature is a legal target but the creature you don't control
//     isn't, it still gets +2/+1 until end of turn if it's a Knight.
//   [2019-10-04] The target creature you control gets +2/+1 only if it's a Knight as Joust
//     resolves. It'll still fight if it doesn't get +2/+1.
//   [2019-10-04] If either target is an illegal target as Joust tries to resolve, neither creature
//     will deal or be dealt damage.

export default defineCard({
  name: "Joust",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose target creature you control and target creature you don't control. The creature you control gets +2/+1 until end of turn if it's a Knight. Then those creatures fight each other. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Knight" } },
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
