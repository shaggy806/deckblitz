import { defineCard } from "../define.js";

// EDHREC rank 10811.

export default defineCard({
  name: "Fall of the Hammer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to another target creature.",
  targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
