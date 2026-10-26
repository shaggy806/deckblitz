import { defineCard } from "../define.js";

// EDHREC rank 9410.
//
// The −7 emblem's search resolves before the creature spell that triggered it
// (the ruling); the creature it puts onto the battlefield isn't cast, so it
// doesn't trigger the emblem again.

const PLUS_TEXT =
  "+1: Reveal the top five cards of your library. Put all creature cards revealed this way into your hand and the rest on the bottom of your library in any order.";
const MINUS_TEXT = "−3: You may put a green creature card from your hand onto the battlefield.";
const EMBLEM_TEXT =
  "Whenever you cast a creature spell, you may search your library for a creature card, put it onto the battlefield, then shuffle.";
const ULT_TEXT = `−7: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Garruk, Caller of Beasts",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: true,
        min: 5,
        max: 5,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-any-order",
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
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", colors: ["G"] },
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
            targets: [],
            effect: {
              kind: "may",
              prompt: "Search your library for a creature card and put it onto the battlefield?",
              effect: {
                kind: "search-library",
                filter: { type: "creature" },
                destination: "battlefield",
                min: 0,
                max: 1,
              },
            },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
