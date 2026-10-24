import { defineCard } from "../define.js";

// EDHREC rank 27655.
//
// Rulings:
//   [2016-07-13] If two of the chosen modes of an escalate spell target a creature, you may choose
//     the same creature for each mode’s target, or choose different creatures.
//   [2016-07-13] You can’t choose any one mode multiple times.
//
// Escalate is Collective Defiance's `costPerExtraMode`; each mode has its own
// target slot, so both may name one creature.
export default defineCard({
  name: "Borrowed Malevolence",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Escalate {2} (Pay this cost for each mode chosen beyond the first.)\nChoose one or both —\n• Target creature gets +1/+1 until end of turn.\n• Target creature gets -1/-1 until end of turn.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    costPerExtraMode: "{2}",
    modes: [
      {
        text: "Target creature gets +1/+1 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      {
        text: "Target creature gets -1/-1 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
    ],
  },
});
