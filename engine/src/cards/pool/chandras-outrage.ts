import { defineCard } from "../define.js";

// EDHREC rank 16612. With the creature an illegal target the spell doesn't
// resolve, and nobody is dealt damage (the ruling).
export default defineCard({
  name: "Chandra's Outrage",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chandra's Outrage deals 4 damage to target creature and 2 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
