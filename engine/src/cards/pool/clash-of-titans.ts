import { defineCard } from "../define.js";

// EDHREC rank 20691. Ikoria: Lair of Behemoths.
//
// Rulings:
//   - If either target is an illegal target as Clash of Titans tries to resolve, neither creature
//     will deal or be dealt damage.
//   - Clash of Titans can target two creatures controlled by the same player.

export default defineCard({
  name: "Clash of Titans",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature fights another target creature. (Each deals damage equal to its power to the other.)",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "fight", a: 0, b: 1 },
});
