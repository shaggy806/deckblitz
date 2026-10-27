import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 12378.
// The second mode's sacrifice is chosen as it resolves, not on casting, and
// is mandatory; with no creature to sacrifice it deals 0 (the rulings).
// Entwined, the modes run in order, so the stolen creature can be the one
// sacrificed.

export default defineCard({
  name: "Grab the Reins",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{2}{R}", keyword: "entwine" },
  text: "Choose one —\n• Until end of turn, you gain control of target creature and it gains haste.\n• Sacrifice a creature. Grab the Reins deals damage equal to that creature's power to any target.\nEntwine {2}{R} (Choose both if you pay the entwine cost.)",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Until end of turn, you gain control of target creature and it gains haste.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: true },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: "Sacrifice a creature. Grab the Reins deals damage equal to that creature's power to any target.",
        targets: ["any-target"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
            { kind: "damage", amount: { thisWay: "sacrificed", sumOf: "power" }, target: 0 },
          ],
        },
      },
    ],
  },
});
