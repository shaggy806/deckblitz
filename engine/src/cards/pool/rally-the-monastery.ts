import { defineCard } from "../define.js";

// EDHREC rank 12395.
//
// Focus the Mind's cost reduction: the cost is worked out before the spell
// becomes cast (rules 601.2f, 601.2i), so any spell already cast this turn is
// "another" spell. Each mode's target slots are its own; "up to two" is two
// optional slots, the second another creature than the first.

const TOKENS_MODE = "Create two 1/1 white Monk creature tokens with prowess.";
const PUMP_MODE = "Up to two target creatures you control each get +2/+2 until end of turn.";
const DESTROY_MODE = "Destroy target creature with power 4 or greater.";

export default defineCard({
  name: "Rally the Monastery",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `This spell costs {2} less to cast if you've cast another spell this turn.\nChoose one —\n• ${TOKENS_MODE}\n• ${PUMP_MODE}\n• ${DESTROY_MODE}`,
  selfCostReduction: {
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
    reduceGeneric: 2,
  },
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: TOKENS_MODE,
        targets: [],
        effect: { kind: "create-token", token: "Monk Token", count: 2 },
      },
      {
        text: PUMP_MODE,
        targets: [
          { kind: "optional", of: "creature-you-control" },
          { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
        ],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
          ],
        },
      },
      {
        text: DESTROY_MODE,
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
