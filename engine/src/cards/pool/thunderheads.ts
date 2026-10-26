import { defineCard } from "../define.js";

// Replicate (rule 702.56a): `kicker` with `keyword: "replicate"`, paid any
// number of times; one cast trigger copies it that many times.
//
// EDHREC rank 30161.
// Its token is the front of a Weird // Goblin double-faced token printing.

export default defineCard({
  name: "Thunderheads",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Replicate {2}{U} (When you cast this spell, copy it for each time you paid its replicate cost.)\nCreate a 3/3 blue Weird creature token with defender and flying. Exile it at the beginning of the next end step.",
  kicker: { cost: "{2}{U}", keyword: "replicate", multi: true },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Weird Token", count: 1, separate: true },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        about: "created",
        effect: { kind: "exile", target: 0 },
        text: "Exile it at the beginning of the next end step.",
      },
    ],
  },
});
