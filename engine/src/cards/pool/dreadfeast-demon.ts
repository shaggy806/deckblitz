import { defineCard } from "../define.js";

// EDHREC rank 13609.
//
// Foul Rebirth's mandatory "sacrifice a non-Demon creature. If you do, …",
// then Phoenix Fleet Airship's copy of this permanent (as it last existed,
// should it have left by then).

const END_TEXT =
  "At the beginning of your end step, sacrifice a non-Demon creature. If you do, create a token that's a copy of this creature.";

export default defineCard({
  name: "Dreadfeast Demon",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature", notSubtypes: ["Demon"] }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", who: "you" },
            then: { kind: "create-token-copy", of: "source", count: 1 },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
