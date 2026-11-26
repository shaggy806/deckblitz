import { defineCard } from "../define.js";

// Core Set 2021 (M21).
//
// "Until the end of your next turn, they can't phase in" is a `prohibit` of `phase-in` on the
// creatures phased out this way (bound as they are, rule 400.7), lasting through Teferi's
// controller's next turn whatever becomes of Teferi; they then phase in at their next untap step.

const PLUS_TEXT = "+1: Draw a card.";
const MINUS_TEXT = "−3: Put target creature on top of its owner's library.";
const ULT_TEXT =
  "−8: Each creature target opponent controls phases out. Until the end of your next turn, they can't phase in. (Treat them and anything attached to them as though they don't exist.)";

export default defineCard({
  name: "Teferi, Timeless Voyager",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "phase-out", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
          {
            kind: "prohibit",
            prohibits: [{ act: "phase-in", target: { thisWay: "phased-out" } }],
            duration: "until-end-of-your-next-turn",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
