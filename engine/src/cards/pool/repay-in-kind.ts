import { defineCard } from "../define.js";

export default defineCard({
  name: "Repay in Kind",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player's life total becomes the lowest life total among all players.",
  targets: [],
  effect: { kind: "set-life-total", who: "each-player", amount: { lowestLifeTotal: true } },
});
