import { defineCard } from "../define.js";

const PLUS = "+1: Until end of turn, up to one target creature gets +1/+1 and gains first strike, vigilance, and lifelink.";
const MINUS =
  "−2: Put a +1/+1 counter on each creature you control and a loyalty counter on each other planeswalker you control.";
const EMBLEM = "If a source would deal damage to you or a planeswalker you control, prevent all but 1 of that damage.";
const ULT = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Ajani Steadfast",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
          {
            kind: "add-counter-all",
            filter: { type: "planeswalker", controlledBy: "you" },
            counter: "loyalty",
            amount: 1,
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: { scope: "self" },
          replacement: {
            event: "would-deal-damage",
            to: "your-side",
            toFilter: { type: "planeswalker" },
            instead: { prevent: { allBut: 1 } },
          },
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
