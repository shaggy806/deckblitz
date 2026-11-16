import { defineCard } from "../define.js";

// EDHREC rank 4555. A text-changing effect over a creature type (rule 612.2):
// the creature type to replace is chosen as it resolves, any one there is or
// not (the rulings), and every instance in the creature's type line and text
// becomes Vampire — a Goblin made a Vampire is no Goblin. The Vampire tapped
// for the cost may be one that came under your control this turn.

export default defineCard({
  name: "New Blood",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, tap an untapped Vampire you control.\nGain control of target creature. Change the text of that creature by replacing all instances of one creature type with Vampire.",
  additionalCost: {
    also: { text: "Tap an untapped Vampire you control", tapUntapped: { filter: { subtype: "Vampire" }, count: 1 } },
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "change-text", target: 0, words: "creature-type", to: "Vampire", duration: "permanent" },
    ],
  },
});
