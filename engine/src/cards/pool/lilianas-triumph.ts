import { defineCard } from "../define.js";

// EDHREC rank 4431.
//
// The ruling's order: each opponent in turn order from the active player
// chooses a creature, all are sacrificed at once; then, if you control a
// Liliana planeswalker as it resolves, each opponent chooses a card face down
// in the same order and all are discarded at once (rule 101.4) — even one who
// had no creature to sacrifice.
export default defineCard({
  name: "Liliana's Triumph",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Each opponent sacrifices a creature of their choice. If you control a Liliana planeswalker, each opponent also discards a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Liliana" }, atLeast: 1 },
        then: { kind: "discard", target: "each-opponent", amount: 1 },
      },
    ],
  },
});
