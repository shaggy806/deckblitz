import { defineCard } from "../define.js";

// EDHREC rank 27446. "Target creature that target Wall blocked this turn" is
// an `other` slot's `blockedThisTurnWith` against the Wall's slot, chosen
// first; the granted abilities are Mindbender Spores', for good (rule 611.2a).

const TEXT =
  'Put X glyph counters on target creature that target Wall blocked this turn, where X is the power of that blocked creature. The creature gains "This creature doesn\'t untap during your untap step if it has a glyph counter on it" and "At the beginning of your upkeep, remove a glyph counter from this creature."';

export default defineCard({
  name: "Glyph of Delusion",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [
    { kind: "permanent", filter: { subtype: "Wall" } },
    {
      kind: "other",
      of: "creature",
      than: { slot: 0 },
      blockedThisTurnWith: "blocked-by",
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 1, counter: "glyph", amount: { powerOf: 1 } },
      {
        kind: "grant-static",
        target: 1,
        ability: {
          affects: { scope: "self" },
          condition: { kind: "self-counters", counter: "glyph", compare: { op: "gte", n: 1 } },
          doesntUntap: true,
          text: "This creature doesn't untap during your untap step if it has a glyph counter on it.",
        },
        duration: "permanent",
      },
      {
        kind: "grant-triggered",
        target: 1,
        ability: {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: { kind: "remove-counter", target: "source", counter: "glyph", amount: 1 },
          resolve: null,
          text: "At the beginning of your upkeep, remove a glyph counter from this creature.",
        },
        duration: "permanent",
      },
    ],
  },
});
