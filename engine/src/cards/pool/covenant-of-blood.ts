import { defineCard } from "../define.js";

export default defineCard({
  name: "Covenant of Blood",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nCovenant of Blood deals 4 damage to any target and you gain 4 life.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
