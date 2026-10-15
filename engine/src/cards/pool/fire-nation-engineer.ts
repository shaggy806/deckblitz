import { defineCard } from "../define.js";

// EDHREC rank 17117.
//
// Rulings:
//   [2025-10-02] Raid abilities evaluate the entire turn to see if you attacked with a creature.
//     That creature doesn't have to still be on the battlefield.
//   [2025-10-02] Raid abilities care only that you attacked with a creature.
//
// Midnight Snack's raid condition; Bounce Off's "creature or Vehicle".

const RAID_TEXT =
  "Raid — At the beginning of your end step, if you attacked this turn, put a +1/+1 counter on another target creature or Vehicle you control.";

export default defineCard({
  name: "Fire Nation Engineer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: RAID_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "other",
          of: {
            kind: "permanent",
            whose: "you",
            filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
          },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
