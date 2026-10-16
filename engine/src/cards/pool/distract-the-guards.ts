import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.

export default defineCard({
  name: "Distract the Guards",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Freerunning {1}{W} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nCreate three 1/1 white Human Rogue creature tokens.",
  freerunning: { cost: "{1}{W}" },
  effect: { kind: "create-token", token: "Human Rogue Token", count: 3 },
});
