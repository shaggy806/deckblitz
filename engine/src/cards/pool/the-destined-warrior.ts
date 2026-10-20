import { defineCard } from "../define.js";

// EDHREC rank 12996.
//
// Rulings:
//   [2020-09-25] The cost reduction applies only once to any spell you cast that's a Cleric,
//     Rogue, Warrior, or Wizard. A spell with more than one of these subtypes will still have its
//     cost reduced by just {1}.
//   [2020-09-25] The cost reduction applies only to generic mana in the total cost.
//   [2020-09-25] Some cards refer to you having a "full party." This is true if the number of
//     creatures in your party is four.

const COST_TEXT = "Cleric, Rogue, Warrior, and Wizard spells you cast cost {1} less to cast.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, creatures you control get +1/+0 until end of turn. If you have a full party, creatures you control get +3/+0 until end of turn instead.";
const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "The Destined Warrior",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike", "vigilance", "menace"],
  text: `First strike, vigilance, menace\n${COST_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] },
        caster: "you",
        reduceGeneric: 1,
      },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "full-party" },
        then: { kind: "modify-pt-all", filter: YOURS, power: 3, toughness: 0, duration: "end-of-turn" },
        else: { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
