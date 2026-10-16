import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.

export default defineCard({
  name: "Brotherhood Ambushers",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 6,
  toughness: 3,
  text: "Freerunning {3}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)",
  freerunning: { cost: "{3}{B}" },
});
