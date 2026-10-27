import { defineCard } from "../define.js";

// EDHREC rank 21240.
//
// Rulings:
//   [2004-10-04] You choose what to sacrifice on resolution.

const YOURS = { controlledBy: "you" } as const;

export default defineCard({
  name: "Renounce",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Sacrifice any number of permanents. You gain 2 life for each permanent sacrificed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: YOURS,
        upTo: { countOf: YOURS },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of permanents",
      },
      { kind: "gain-life", amount: { product: [2, { thisWay: "sacrificed" }] } },
    ],
  },
});
