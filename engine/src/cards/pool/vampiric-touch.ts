import { defineCard } from "../define.js";

export default defineCard({
  name: "Vampiric Touch",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Vampiric Touch deals 2 damage to target opponent or planeswalker and you gain 2 life.",
  targets: ["opponent-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
