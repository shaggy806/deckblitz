import { defineCard } from "../define.js";

const PLUS =
  "+1: You may discard a card. If you do, draw a card. If a creature card was discarded this way, draw two cards instead.";
const MINUS =
  "−2: Return target creature card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of your next upkeep.";
const EMBLEM = "Whenever a creature you control enters, it deals damage equal to its power to any target.";
const ULT = `−7: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Lukka, Wayward Bonder",
  art: "https://cards.scryfall.io/art_crop/back/8/e/8e4e0f81-f92b-4a3a-bb29-adcc3de211b4.jpg",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Lukka"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              // Two cards instead of one for a creature card.
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", filter: { type: "creature" } },
              then: { kind: "draw", amount: 2 },
              else: {
                kind: "conditional",
                condition: { kind: "this-way", what: "discarded" },
                then: { kind: "draw", amount: 1 },
              },
            },
          ],
        },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: { step: "upkeep", whose: "you" },
            effect: { kind: "exile", target: 0 },
            text: "Exile the creature Lukka returned to the battlefield.",
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
        triggered: [
          {
            trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
            targets: ["any-target"],
            effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
  faces: ["Mila, Crafty Companion", "Lukka, Wayward Bonder"],
});
