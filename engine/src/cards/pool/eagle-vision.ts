import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.

export default defineCard({
  name: "Eagle Vision",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Freerunning {1}{U} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nDraw three cards.",
  freerunning: { cost: "{1}{U}" },
  effect: { kind: "draw", amount: 3 },
});
