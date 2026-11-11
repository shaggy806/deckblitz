import { defineCard } from "../define.js";

// EDHREC rank 5603.
//
// Rulings:
//   [2023-09-01] Agatha of the Vile Cauldron's first ability affects only abilities of creatures
//     you control on the battlefield. The costs of activated abilities of creature cards that work
//     in other zones (such as cycling) won't be reduced.
//
// Training Grounds with X read live: Agatha's power as the cost is worked out.
const REDUCE_TEXT =
  "Activated abilities of creatures you control cost {X} less to activate, where X is Agatha's power. This effect can't reduce the mana in that cost to less than one mana.";
const PUMP_TEXT = "{4}{R}{G}: Other creatures you control get +1/+1 and gain trample and haste until end of turn.";

export default defineCard({
  name: "Agatha of the Vile Cauldron",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 1,
  text: `${REDUCE_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { type: "creature", controlledBy: "you" },
        reduceGeneric: { powerOf: "source" },
        leavesOneMana: true,
      },
      text: REDUCE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            keyword: "trample",
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
