import { defineCard } from "../define.js";

export default defineCard({
  name: "Decorum Dissertation",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text:
    "Target player draws two cards and loses 2 life.\n" +
    "Paradigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "lose-life", amount: 2, target: 0 },
      { kind: "paradigm" },
    ],
  },
  exileOnResolve: true,
});
