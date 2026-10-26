import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 15301. Paradoxical Outcome's return: the
// whole group leaves as one instruction.
//
// Rulings:
//   [2013-04-15] You must sacrifice exactly one creature to cast this spell; you cannot cast it
//     without sacrificing a creature, and you cannot sacrifice additional creatures.
//   [2013-04-15] Players can only respond once this spell has been cast and all its costs have
//     been paid. No one can try to destroy the creature you sacrificed to prevent you from casting
//     this spell.

export default defineCard({
  name: "Scapegoat",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nReturn any number of target creatures you control to their owner's hand.",
  targets: [{ kind: "any-number", of: "creature-you-control" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true },
});
