import { defineCard } from "../define.js";

export default defineCard({
  name: "Sorin's Vengeance",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Sorin's Vengeance deals 10 damage to target player or planeswalker and you gain 10 life.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 10, target: 0 }, { kind: "gain-life", amount: 10 }],
  },
});
