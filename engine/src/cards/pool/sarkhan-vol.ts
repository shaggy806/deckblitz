import { defineCard } from "../define.js";

// EDHREC rank 16402.

const PLUS_TEXT = "+1: Creatures you control get +1/+1 and gain haste until end of turn.";
const MINUS2_TEXT =
  "−2: Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.";
const MINUS6_TEXT = "−6: Create five 4/4 red Dragon creature tokens with flying.";

export default defineCard({
  name: "Sarkhan Vol",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sarkhan"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS2_TEXT}\n${MINUS6_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: MINUS2_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 5 },
      resolve: null,
      text: MINUS6_TEXT,
    },
  ],
});
