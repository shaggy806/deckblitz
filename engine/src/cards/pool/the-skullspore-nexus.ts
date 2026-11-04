import { defineCard } from "../define.js";

// EDHREC rank 1647.
//
// Rulings:
//   Use the power of the nontoken creatures that died as they last existed on
//   the battlefield (fixed as the ability triggers: `batchValue`).
//   To double a creature's power, it gets +X/+0, X its power as the ability
//   resolves.
const COST_TEXT = "This spell costs {X} less to cast, where X is the greatest power among creatures you control.";
const DIES_TEXT =
  "Whenever one or more nontoken creatures you control die, create a green Fungus Dinosaur creature token with base power and toughness each equal to the total power of those creatures.";
const DOUBLE_TEXT = "{2}, {T}: Double target creature's power until end of turn.";

const THAT_POWER = { triggerValue: true } as const;

export default defineCard({
  name: "The Skullspore Nexus",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: `${COST_TEXT}\n${DIES_TEXT}\n${DOUBLE_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
  },
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", token: false },
        batched: true,
        batchValue: "total-power",
      },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fungus Dinosaur Token",
        count: 1,
        basePt: { power: THAT_POWER, toughness: THAT_POWER },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: 0, doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
