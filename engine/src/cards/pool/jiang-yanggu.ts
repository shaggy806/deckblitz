import { defineCard } from "../define.js";

const PLUS_TEXT = "+1: Target creature gets +2/+2 until end of turn.";
const MINUS_TEXT = "−1: If you don't control a creature named Mowu, create Mowu, a legendary 3/3 green Dog creature token.";
const ULT_TEXT =
  "−5: Until end of turn, target creature gains trample and gets +X/+X, where X is the number of lands you control.";
const LANDS = { countOf: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "Jiang Yanggu",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Yanggu"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { type: "creature", name: "Mowu" }, atLeast: 1 } },
        then: { kind: "create-token", token: "Mowu", count: 1 },
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: LANDS, toughness: LANDS, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
