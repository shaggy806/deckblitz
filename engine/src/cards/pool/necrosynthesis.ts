import { defineCard } from "../define.js";

// EDHREC rank 9457.
//
// Rulings:
//   [2021-09-24] Use the enchanted creature's power as it last existed on the battlefield to
//     determine the value of X.
//
// The dies trigger's object is the creature that died, so X is its
// last-known power (`powerOf: "trigger-object"`); the library looked at is the
// Aura's controller's.
const GRANT_TEXT =
  'Enchanted creature has "Whenever another creature dies, put a +1/+1 counter on this creature."';
const DIES_TEXT =
  "When enchanted creature dies, look at the top X cards of your library, where X is its power. Put one of those cards into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Necrosynthesis",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${DIES_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "any", otherOnly: true, filter: { type: "creature" } },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: "Whenever another creature dies, put a +1/+1 counter on this creature.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { powerOf: "trigger-object" },
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
