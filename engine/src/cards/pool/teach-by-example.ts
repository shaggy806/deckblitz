import { defineCard } from "../define.js";

// EDHREC rank 7735. Striking Palette's delayed trigger: the next instant or
// sorcery cast this turn is copied whether or not it has targets (ruling),
// with its modes, X and paid costs.

export default defineCard({
  name: "Teach by Example",
  manaCost: "{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "({U/R} can be paid with either {U} or {R}.)\nWhen you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.",
  effect: {
    kind: "delayed-trigger",
    at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
    effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
    text: "Copy that spell. You may choose new targets for the copy.",
  },
});
