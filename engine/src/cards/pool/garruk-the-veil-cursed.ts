import { defineCard } from "../define.js";

// Back face of Garruk Relentless // Garruk, the Veil-Cursed.
//
// Rulings:
//   [2011-09-22] Only creatures you control when the third ability resolves will receive the
//     bonus, and the number of creature cards in your graveyard is counted as it resolves.
//   [2011-09-22] The second ability doesn't target a creature. However, when that ability
//     resolves, you must sacrifice a creature if you control one.

const WOLF = "+1: Create a 1/1 black Wolf creature token with deathtouch.";
const TUTOR =
  "−1: Sacrifice a creature. If you do, search your library for a creature card, reveal it, put it into your hand, then shuffle.";
const OVERRUN =
  "−3: Creatures you control gain trample and get +X/+X until end of turn, where X is the number of creature cards in your graveyard.";

const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

export default defineCard({
  name: "Garruk, the Veil-Cursed",
  art: "https://cards.scryfall.io/art_crop/back/6/8/6897514f-e396-46d6-91e3-158366c741bb.jpg",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  text: `${WOLF}\n${TUTOR}\n${OVERRUN}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Black Wolf Token (Deathtouch)", count: 1 },
      resolve: null,
      text: WOLF,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed" },
            then: {
              kind: "search-library",
              filter: { type: "creature" },
              destination: "hand",
              min: 0,
              max: 1,
              reveal: true,
            },
          },
        ],
      },
      resolve: null,
      text: TUTOR,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: X,
            toughness: X,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: OVERRUN,
    },
  ],
  faces: ["Garruk Relentless", "Garruk, the Veil-Cursed"],
  transform: true,
});
