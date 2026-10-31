import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3). EDHREC rank 7847. The counter first, so the
// creature it lands on is modified (rule 700.9) and deals damage too; each
// modified creature is a source of its own, all at once.

export default defineCard({
  name: "Signature Slam",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "Put a +1/+1 counter on target creature you control, then each modified creature you control deals damage equal to its power to target creature you don't control. (Equipment, Auras you control, and counters are modifications.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      {
        kind: "each-deals-damage",
        filter: { type: "creature", controlledBy: "you", modified: true },
        amount: "its-power",
        to: 1,
      },
    ],
  },
});
