import { defineCard } from "../define.js";

// EDHREC rank 25985.
//
// Rulings:
//   [2013-04-15] You must sacrifice exactly one creature to cast this spell; you cannot cast it
//     without sacrificing a creature, and you cannot sacrifice additional creatures.
//   [2013-04-15] Players can only respond once this spell has been cast and all its costs have
//     been paid. No one can try to destroy the creature you sacrificed to prevent you from casting
//     this spell.

export default defineCard({
  name: "Final Strike",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nFinal Strike deals damage to target opponent or planeswalker equal to the sacrificed creature's power.",
  targets: ["opponent-or-planeswalker"],
  effect: { kind: "damage", target: 0, amount: { powerOf: "sacrificed" } },
});
