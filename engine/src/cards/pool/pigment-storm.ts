import { defineCard } from "../define.js";

// EDHREC rank 25715.
//
// Rulings:
//   [2021-04-16] Excess damage has been dealt to a creature if the damage dealt to it is greater
//     than lethal damage.
//   [2021-04-16] If the target creature is an illegal target by the time Pigment Storm tries to
//     resolve, the spell won't resolve. It won't deal damage to any player.
export default defineCard({
  name: "Pigment Storm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Pigment Storm deals 5 damage to target creature. Excess damage is dealt to that creature's controller instead.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0, excessToController: {} },
});
