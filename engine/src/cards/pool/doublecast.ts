import { defineCard } from "../define.js";

// EDHREC rank 11548.
//
// Rulings:
//   Two Doublecasts make two delayed triggers; the copy is created even if the
//   spell has been countered, keeps its X and modes, and isn't cast.

const TEXT =
  "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Doublecast",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
    effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
    text: TEXT,
  },
});
