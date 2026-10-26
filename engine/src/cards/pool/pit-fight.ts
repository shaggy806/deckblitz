import { defineCard } from "../define.js";

// EDHREC rank 11258.
//
// Rulings:
//   [2013-01-24] The second target of Pit Fight can be another creature you control, but it can't
//     be the same creature as the first target.
//   [2013-01-24] If either target of Pit Fight is an illegal target when the ability tries to
//     resolve, neither creature will deal or be dealt damage.

export default defineCard({
  name: "Pit Fight",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Target creature you control fights another target creature. (Each deals damage equal to its power to the other.)",
  targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "fight", a: 0, b: 1 },
});
