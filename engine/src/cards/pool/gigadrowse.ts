import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 10878.

export default defineCard({
  name: "Gigadrowse",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Replicate {U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nTap target permanent.",
  kicker: { cost: "{U}", keyword: "replicate", multi: true },
  targets: ["permanent"],
  effect: { kind: "tap", target: 0 },
});
