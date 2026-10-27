import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 31849. Kindle's shape: every graveyard counts,
// and Flame Burst itself is still on the stack as it resolves.

export default defineCard({
  name: "Flame Burst",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flame Burst deals X damage to any target, where X is 2 plus the number of cards named Flame Burst in all graveyards.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { sum: [2, { countInGraveyard: { name: "Flame Burst" } }] } },
});
