import { defineCard } from "../define.js";

// "This spell costs 3 life more to cast for each target" — a cost increase
// (rule 601.2f) over the targets chosen first (601.2c):
// `additionalCost.payLifePerTarget`. Any number of targets, none included.

export default defineCard({
  name: "Phyrexian Purge",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "This spell costs 3 life more to cast for each target.\nDestroy any number of target creatures.",
  additionalCost: { payLifePerTarget: 3 },
  targets: [{ kind: "any-number", of: "creature" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
});
