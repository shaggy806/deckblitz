import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times — each copy
// may counter a different spell, each its own "unless".
//
// EDHREC rank 10397. Modern Horizons 2.

export default defineCard({
  name: "Lose Focus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Replicate {U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nCounter target spell unless its controller pays {2}.",
  kicker: { cost: "{U}", keyword: "replicate", multi: true },
  targets: ["spell"],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
});
