import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 20453.

export default defineCard({
  name: "Pyromatics",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Replicate {1}{R} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nPyromatics deals 1 damage to any target.",
  kicker: { cost: "{1}{R}", keyword: "replicate", multi: true },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 1, target: 0 },
});
