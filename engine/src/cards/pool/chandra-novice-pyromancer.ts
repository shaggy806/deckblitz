import { defineCard } from "../define.js";

// EDHREC rank 13843. The −1 is a loyalty ability, so not a mana ability
// (rule 605.1a): sorcery speed, on the stack. The +1 affects only the
// Elementals there as it resolves (the rulings).

const PUMP = "+1: Elementals you control get +2/+0 until end of turn.";
const MANA = "−1: Add {R}{R}.";
const BOLT = "−2: Chandra deals 2 damage to any target.";

export default defineCard({
  name: "Chandra, Novice Pyromancer",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 5,
  text: `${PUMP}\n${MANA}\n${BOLT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Elemental", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 2 },
      resolve: null,
      text: MANA,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: BOLT,
    },
  ],
});
