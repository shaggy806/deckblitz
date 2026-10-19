import { defineCard } from "../define.js";

// Streets of New Capenna. The +2 may be activated without sacrificing
// anything, and then does nothing (its ruling).
const PLUS_TWO =
  "+2: You may sacrifice a creature. If you do, search your library for a creature card with mana value equal to 1 plus the sacrificed creature's mana value, put it onto the battlefield, then shuffle.";
const PLUS_ONE = "+1: Mill five cards, then put any number of creature cards milled this way into your hand.";
const MINUS_ONE = "−1: Create a 4/4 green Rhino Warrior creature token.";

export default defineCard({
  name: "Vivien on the Hunt",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vivien"],
  loyalty: 4,
  text: `${PLUS_TWO}\n${PLUS_ONE}\n${MINUS_ONE}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "search-library",
          filter: {
            type: "creature",
            manaValue: { op: "eq", n: { amount: { sum: [{ manaValueOf: "sacrificed" }, 1] } } },
          },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 5 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 5,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "creature" },
          },
        ],
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Rhino Warrior Token", count: 1 },
      resolve: null,
      text: MINUS_ONE,
    },
  ],
});
