import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 26727.
//
// Once per blocker (`blocked-by`), the blocker the trigger object. X is read
// as the ability resolves, half the blocker's power rounded down, and never
// below 0 (rule 107.1b — a blocker with negative power gets -0/-0, not a
// bonus): the `difference` against 0 clamps it.

const TEXT =
  "Whenever this creature becomes blocked by a nonartifact, non-Dragon creature, that creature gets -X/-0 until end of turn, where X is half the creature's power, rounded down.";

export default defineCard({
  name: "Catacomb Dragon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "blocked-by",
        who: "self",
        blocker: { type: "creature", notTypes: ["artifact"], notSubtypes: ["Dragon"] },
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: {
          product: [-1, { difference: [{ half: { powerOf: "trigger-object" }, round: "down" }, 0] }],
        },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
