import { defineCard } from "../define.js";

// EDHREC rank 2077.
//
// Rulings:
//   [2017-04-18] A creature that is a Zombie and has other types, such as a Zombie Jackal, isn't a
//     non-Zombie creature.
//
// The returned creature is a black Zombie as it enters (`enterAs`, rule
// 614.12 — Rise from the Grave), its own colours and types kept.
const PLUS_TEXT = "+1: Create a 2/2 black Zombie creature token. Mill two cards.";
const MINUS_TEXT =
  "−3: Return target creature card from your graveyard to the battlefield. That creature is a black Zombie in addition to its other colors and types.";
const ULT_TEXT = "−7: Destroy all non-Zombie creatures.";

export default defineCard({
  name: "Liliana, Death's Majesty",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Zombie Token", count: 1 },
          { kind: "mill", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        enterAs: { addColors: ["B"], addSubtypes: ["Zombie"] },
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notSubtypes: ["Zombie"] } },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
