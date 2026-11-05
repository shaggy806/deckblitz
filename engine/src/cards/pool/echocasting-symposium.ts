import { defineCard } from "../define.js";

export default defineCard({
  name: "Echocasting Symposium",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text:
    "Target player creates a token that's a copy of target creature you control.\n" +
    "Paradigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
  targets: ["player", "creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token-copy", of: 1, count: 1, who: { target: 0 } },
      { kind: "paradigm" },
    ],
  },
  exileOnResolve: true,
});
