import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 19626. Death Grasp's shape on a
// creature-only target.

export default defineCard({
  name: "Swallowing Plague",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Swallowing Plague deals X damage to target creature and you gain X life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "gain-life", amount: "x" },
    ],
  },
});
