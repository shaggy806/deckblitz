import { defineCard } from "../define.js";

// EDHREC rank 15776.
//
// "Modified" is the filter `modified: true` (rule 700.9), checked as the
// spell resolves, after the pump.

export default defineCard({
  name: "Ambitious Assault",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Creatures you control get +2/+0 until end of turn. If you control a modified creature, draw a card. (Equipment, Auras you control, and counters are modifications.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", modified: true }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
