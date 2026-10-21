import { defineCard } from "../define.js";

const PLUS = "+1: Up to one target creature gets +3/+0 and gains first strike until end of turn.";
const MINUS = "−2: Rowan deals 1 damage to each of up to two target creatures. Those creatures can't block this turn.";
const ULT = "−9: Gain control of all creatures until end of turn. Untap them. They gain haste until end of turn.";

const ALL = { type: "creature" } as const;

export default defineCard({
  name: "Rowan, Fearless Sparkmage",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Rowan"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      // Two different creatures (its ruling: not the same one twice).
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      // A creature whose damage is prevented still can't block (its ruling).
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "damage", amount: 1, target: 0 },
              { kind: "damage", amount: 1, target: 1 },
            ],
          },
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          { kind: "restrict", target: 1, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control-all", filter: ALL, untilEndOfTurn: true },
          { kind: "untap-all", filter: ALL },
          { kind: "grant-keyword-all", filter: ALL, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
