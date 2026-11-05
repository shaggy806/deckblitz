import { defineCard } from "../define.js";

// EDHREC rank 3090.
//
// A planeswalker that's also a creature is counted twice by the +1 (the ruling): the sum reads each
// count on its own. The 0's condition is read as it resolves (the ruling), and Ajani goes with the
// rest in one move.

const GAIN = "+1: You gain life equal to the number of creatures you control plus the number of planeswalkers you control.";
const PRIDEMATE =
  "−2: Create a 2/2 white Cat Soldier creature token named Ajani's Pridemate with \"Whenever you gain life, put a +1/+1 counter on this token.\"";
const EXILE = "0: If you have at least 15 life more than your starting life total, exile Ajani and each artifact and creature your opponents control.";

export default defineCard({
  name: "Ajani, Strength of the Pride",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 5,
  text: `${GAIN}\n${PRIDEMATE}\n${EXILE}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: {
          sum: [{ countOf: { type: "creature", controlledBy: "you" } }, { countOf: { type: "planeswalker", controlledBy: "you" } }],
        },
      },
      resolve: null,
      text: GAIN,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ajani's Pridemate Token", count: 1 },
      resolve: null,
      text: PRIDEMATE,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "life-total", atLeast: { startingPlus: 15 } },
        then: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "exile", target: "source" },
            { kind: "exile-all", filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "opponent" } },
          ],
        },
      },
      resolve: null,
      text: EXILE,
    },
  ],
});
