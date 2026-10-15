import { defineCard } from "../define.js";

// Pigment Wrangler's prepare spell (rule 722): no card of its own. Galvanic
// Iteration's delayed trigger: the copy keeps the spell's modes, X and paid
// costs, and the next instant or sorcery is copied whether or not it targets.

export default defineCard({
  name: "Striking Palette",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.",
  effect: {
    kind: "delayed-trigger",
    at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
    effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
    text: "Copy that spell. You may choose new targets for the copy.",
  },
  prepareSpellOnly: true,
});
