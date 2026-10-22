import { defineCard } from "../define.js";

// EDHREC rank 22467.
//
// Rulings:
//   [2017-07-14] If the targeted creature is an illegal target as it resolves, the spell doesn't
//     resolve and deals no damage to any player.

export default defineCard({
  name: "Blur of Blades",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Put a -1/-1 counter on target creature. Blur of Blades deals 2 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
