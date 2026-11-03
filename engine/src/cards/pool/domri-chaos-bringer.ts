import { defineCard } from "../define.js";

// The +1's riot rides on the mana (rule 106.6), so it's the spell that mana
// pays for that gains it, with the mana's source long gone: not a trigger.

const PLUS_TEXT = "+1: Add {R} or {G}. If that mana is spent on a creature spell, it gains riot. (It enters with your choice of a +1/+1 counter or haste.)";
const MINUS_TEXT =
  "−3: Look at the top four cards of your library. You may reveal up to two creature cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.";
const ULT_TEXT =
  '−8: You get an emblem with "At the beginning of each end step, create a 4/4 red and green Beast creature token with trample."';

export default defineCard({
  name: "Domri, Chaos Bringer",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Domri"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "G"] },
        amount: 1,
        spellGains: { spell: { type: "creature" }, keywords: ["riot"], lasting: true },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 2,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "At the beginning of each end step, create a 4/4 red and green Beast creature token with trample.",
        triggered: [
          {
            trigger: { on: "step-begins", step: "end", who: "any" },
            targets: [],
            effect: { kind: "create-token", token: "Beast Token (Red-Green)", count: 1 },
            resolve: null,
            text: "At the beginning of each end step, create a 4/4 red and green Beast creature token with trample.",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
