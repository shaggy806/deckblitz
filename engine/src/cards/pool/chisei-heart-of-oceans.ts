import { defineCard } from "../define.js";

// EDHREC rank 19125.
//
// "Unless you remove a counter from a permanent you control": a counter of
// any kind, from any permanent you control (Chisei included), which one
// chosen as it resolves — or none, and Chisei is sacrificed. With no counter
// to remove, it's sacrificed.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice Chisei unless you remove a counter from a permanent you control.";

export default defineCard({
  name: "Chisei, Heart of Oceans",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counters", from: {}, counter: "any", count: 1, upTo: true },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "this-way", what: "counters-removed" } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
