import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-05] Once an Assassin creature or commander you control deals combat damage to a player
//     in a turn, you can cast spells for their freerunning costs for the rest of that turn. It
//     doesn't matter what happens to that Assassin or commander after that.

export default defineCard({
  name: "Restart Sequence",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nReturn target creature card from your graveyard to the battlefield.",
  freerunning: { cost: "{1}{B}" },
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "put-onto-battlefield", target: 0 },
});
