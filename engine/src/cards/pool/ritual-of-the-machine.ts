import { defineCard } from "../define.js";

// Rulings:
//   [2013-04-15] You must sacrifice exactly one creature to cast this spell; you cannot cast it
//     without sacrificing a creature, and you cannot sacrifice additional creatures.

export default defineCard({
  name: "Ritual of the Machine",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nGain control of target nonartifact, nonblack creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] } }],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
});
