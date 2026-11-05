import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// The back face of Invasion of New Phyrexia. The −3 taps as it resolves,
// none if you like, and its reflexive trigger always follows, its X the
// number tapped this way and its target chosen then (the rulings).

const PLUS_TEXT = "+1: Draw two cards. Then discard two cards unless you discard a creature card.";
const EMBLEM_TEXT = "Knights you control get +1/+0 and have ward {1}.";
const MINUS_TWO_TEXT = `−2: You get an emblem with "${EMBLEM_TEXT}"`;
const MINUS_THREE_TEXT =
  "−3: Tap any number of untapped creatures you control. When you do, shuffle target nonland permanent an opponent controls with mana value X or less into its owner's library, where X is the number of creatures tapped this way.";
const UNTAPPED_CREATURE = { type: "creature", controlledBy: "you", tapped: false } as const;

export default defineCard({
  name: "Teferi Akosa of Zhalfir",
  art: "https://cards.scryfall.io/art_crop/back/1/b/1b83af86-e1a9-4be1-83dc-0c1ab81b129e.jpg",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Teferi"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TWO_TEXT}\n${MINUS_THREE_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2, unlessOne: { type: "creature" } },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: {
          affects: { scope: "filter", filter: { subtype: "Knight", controlledBy: "you" } },
          grantPt: [1, 0],
          grantsTriggered: [{ ...ward({ mana: "{1}" }), text: "Ward {1}" }],
          text: EMBLEM_TEXT,
        },
      },
      resolve: null,
      text: MINUS_TWO_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: UNTAPPED_CREATURE,
            min: 0,
            upTo: { countOf: UNTAPPED_CREATURE },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of untapped creatures you control",
          },
          {
            kind: "reflexive-trigger",
            value: { thisWay: "tapped" },
            targets: [
              {
                kind: "permanent",
                whose: "opponent",
                filter: { notTypes: ["land"], manaValue: { op: "lte", n: { amount: { triggerValue: true } } } },
              },
            ],
            effect: { kind: "shuffle-into-library", target: 0 },
            text: "When you do, shuffle target nonland permanent an opponent controls with mana value X or less into its owner's library, where X is the number of creatures tapped this way.",
          },
        ],
      },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
  ],
  faces: ["Invasion of New Phyrexia", "Teferi Akosa of Zhalfir"],
  transform: true,
});
