import { defineCard } from "../define.js";

export default defineCard({
  name: "Taste of Blood",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Taste of Blood deals 1 damage to target player or planeswalker and you gain 1 life.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
  },
});
