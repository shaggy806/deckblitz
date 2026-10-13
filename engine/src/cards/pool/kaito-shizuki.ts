import { defineCard } from "../define.js";

// EDHREC rank 6318. Makes "Ninja Token (Kaito Shizuki)".
//
// The end step trigger is an intervening "if" (rule 603.4): Kaito entered
// this turn as it triggers and as it resolves. Phased out (rule 702.26b),
// Auras on him go with him and he phases in as your next untap step begins,
// with the loyalty he had (the rulings) — and phasing in isn't entering, so
// he stays in next turn. "Unless you attacked this turn" is Chart a
// Course's.
const END = "At the beginning of your end step, if Kaito entered this turn, he phases out.";
const PLUS = "+1: Draw a card. Then discard a card unless you attacked this turn.";
const MINUS = "−2: Create a 1/1 blue Ninja creature token with \"This token can't be blocked.\"";
const EMBLEM =
  "Whenever a creature you control deals combat damage to a player, search your library for a blue or black creature card, put it onto the battlefield, then shuffle.";
const ULTIMATE = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Kaito Shizuki",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaito"],
  loyalty: 3,
  text: `${END}\n${PLUS}\n${MINUS}\n${ULTIMATE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      effect: { kind: "phase-out", target: "source" },
      resolve: null,
      text: END,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 } },
            then: { kind: "discard", target: "you", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ninja Token (Kaito Shizuki)", count: 1 },
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
        triggered: [
          {
            trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
            targets: [],
            effect: {
              kind: "search-library",
              filter: { type: "creature", anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
              destination: "battlefield",
              min: 0,
              max: 1,
            },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
