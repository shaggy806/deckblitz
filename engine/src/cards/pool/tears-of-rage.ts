import { defineCard } from "../define.js";

// EDHREC rank 19493.
//
// "Those creatures" are the ones the pump affected (rule 611.2c): the
// attacking creatures you control as it resolves, remembered right after it.
// A creature that leaves and comes back is a new object (400.7), and one you
// no longer control can't be sacrificed by you (701.21a).

const PUMP_TEXT =
  "Attacking creatures you control get +X/+0 until end of turn, where X is the number of attacking creatures. Sacrifice those creatures at the beginning of the next end step.";

const ATTACKERS = { type: "creature", attacking: true, controlledBy: "you" } as const;

export default defineCard({
  name: "Tears of Rage",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Cast this spell only during the declare attackers step.\n${PUMP_TEXT}`,
  castOnlyIf: { kind: "turn-structure", steps: ["declare-attackers"] },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: ATTACKERS,
        power: { countOf: { type: "creature", attacking: true } },
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "delayed-trigger",
        at: { step: "end" },
        remember: { those: { set: { onBattlefield: ATTACKERS } } },
        effect: { kind: "sacrifice-all", who: "you", filter: { inSet: { remembered: "those" } } },
        text: "Sacrifice those creatures at the beginning of the next end step.",
      },
    ],
  },
});
