import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 21771.

export default defineCard({
  name: "Train of Thought",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Replicate {1}{U} (When you cast this spell, copy it for each time you paid its replicate cost.)\nDraw a card.",
  kicker: { cost: "{1}{U}", keyword: "replicate", multi: true },
  targets: [],
  effect: { kind: "draw", amount: 1 },
});
