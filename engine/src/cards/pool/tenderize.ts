import { defineCard } from "../define.js";

// EDHREC rank 16179.
//
// Rulings:
//   [2026-01-27] If either target is an illegal target as Tenderize resolves, the creature you
//     control won't deal damage.


// Giantfall's one-sided fight: with either target illegal, no damage (the
// ruling — `fight` deals nothing unless both are still there and legal).
export default defineCard({
  name: "Tenderize",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
});
