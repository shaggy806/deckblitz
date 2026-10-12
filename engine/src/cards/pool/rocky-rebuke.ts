import { defineCard } from "../define.js";

// EDHREC rank 7945.

export default defineCard({
  name: "Rocky Rebuke",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
