import { defineCard } from "../define.js";

const SCRY = "+1: Scry 1. You may tap an untapped artifact you control. If you do, draw a card.";
const THOPTERS =
  "−2: Create two 1/1 colorless Thopter artifact creature tokens with flying. They gain haste until end of turn.";
const ANTHEM = "Artifact creatures you control get +1/+1";
const DISCOUNT = "Artifact spells you cast cost {1} less to cast.";
const ULT = `−4: You get an emblem with "${ANTHEM}" and "${DISCOUNT}"`;

export default defineCard({
  name: "Saheeli, Filigree Master",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Saheeli"],
  loyalty: 3,
  text: `${SCRY}\n${THOPTERS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          {
            kind: "choose-permanents",
            filter: { type: "artifact", controlledBy: "you", tapped: false },
            min: 0,
            upTo: 1,
            then: { kind: "tap", target: 0 },
            prompt: "You may tap an untapped artifact you control",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "tapped" },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: SCRY,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 2, gainUntilEndOfTurn: ["haste"] },
      resolve: null,
      text: THOPTERS,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: `${ANTHEM}. ${DISCOUNT}`,
        static: {
          affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
          grantPt: [1, 1],
          text: ANTHEM,
        },
        moreStatics: [
          {
            affects: { scope: "self" },
            costModification: { applies: { type: "artifact", controlledBy: "you" }, reduceGeneric: 1 },
            text: DISCOUNT,
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
