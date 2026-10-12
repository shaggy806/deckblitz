import { defineCard } from "../define.js";

// EDHREC rank 12457.
//
// Rulings:
//   [2025-11-17] If the first mode is chosen and either target is an illegal target as Giantfall
//     tries to resolve, the creature you control won't deal damage.

export default defineCard({
  name: "Giantfall",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Target creature you control deals damage equal to its power to target creature an opponent controls.\n• Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        // A target gone illegal blanks its slot, and `fight` with a blank
        // slot deals nothing (the ruling).
        text: "Target creature you control deals damage equal to its power to target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1, oneSided: true },
      },
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
