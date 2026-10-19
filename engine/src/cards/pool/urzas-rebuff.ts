import { defineCard } from "../define.js";

// EDHREC rank 9556.
//
// A modal spell (`castModal`), the tap mode Eddymurk Crab's "up to two
// target creatures" (two optional slots, the second another creature).

const COUNTER = "Counter target spell.";
const TAP = "Tap up to two target creatures.";

export default defineCard({
  name: "Urza's Rebuff",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${COUNTER}\n• ${TAP}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: COUNTER, targets: ["spell"], effect: { kind: "counter", target: 0 } },
      {
        text: TAP,
        targets: [
          { kind: "optional", of: "creature" },
          { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: 0 },
            { kind: "tap", target: 1 },
          ],
        },
      },
    ],
  },
});
