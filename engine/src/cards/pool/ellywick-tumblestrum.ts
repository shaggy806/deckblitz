import { defineCard } from "../define.js";

// EDHREC rank 14843.
//
// The emblem counts the differently named dungeons its owner has completed
// (rule 309.7), read live: `grantPtPerCount`'s `dungeonsCompleted`, each name
// once however often it was completed.

const PLUS = "+1: Venture into the dungeon. (Enter the first room or advance to the next room.)";
const MINUS =
  "−2: Look at the top six cards of your library. You may reveal a creature card from among them and put it into your hand. If it's legendary, you gain 3 life. Put the rest on the bottom of your library in a random order.";
const EMBLEM =
  "Creatures you control have trample and haste and get +2/+2 for each differently named dungeon you've completed.";
const ULT = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Ellywick Tumblestrum",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ellywick"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 6,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { type: "creature" },
            destination: "hand",
            leftover: "bottom-random",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", filter: { supertype: "legendary" } },
            then: { kind: "gain-life", amount: 3 },
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
          affects: { scope: "creatures-you-control" },
          grantKeywords: ["trample", "haste"],
          grantPtPerCount: { dungeonsCompleted: "differently-named", pt: [2, 2] },
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
