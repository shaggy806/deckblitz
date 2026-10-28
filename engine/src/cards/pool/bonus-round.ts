import { defineCard } from "../define.js";

// The caster of the spell controls the copy and chooses its new targets
// (the ruling); the copy is made even if that spell has been countered by
// then, and isn't cast, so it fires nothing that watches casts.

const TEXT =
  "Until end of turn, whenever a player casts an instant or sorcery spell, that player copies it and may choose new targets for the copy.";

export default defineCard({
  name: "Bonus Round",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"] } } },
    effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, controller: "trigger-controller" },
    text: "Whenever a player casts an instant or sorcery spell this turn, that player copies it and may choose new targets for the copy.",
  },
});
