import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 29928.

export default defineCard({
  name: "Vacuumelt",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Replicate {2}{U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nReturn target creature to its owner's hand.",
  kicker: { cost: "{2}{U}", keyword: "replicate", multi: true },
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
});
