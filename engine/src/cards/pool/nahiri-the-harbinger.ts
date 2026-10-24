import { defineCard } from "../define.js";

// EDHREC rank 9051.
//
// Rulings:
//   [2016-04-08] You can activate Nahiri's first ability with no intention of discarding a card
//     just to add loyalty to Nahiri.
//   [2016-04-08] If the artifact or creature put onto the battlefield with Nahiri's third ability
//     leaves the battlefield before the next end step, it won't be returned to your hand from its
//     new zone.
//   [2016-04-08] If you find a noncreature artifact with Nahiri's third ability, it will still
//     gain haste, even though it won't be meaningful unless that artifact becomes a creature.
// The −8's "it" is the card the search put onto the battlefield — the `thisWay`
// clause, read off this resolution's own events (Random Encounter's shape). The
// haste filter names no card type, so a noncreature artifact gains it too (the
// ruling), and the delayed return reaches only that object, so one that left
// before the end step stays where it went (rule 400.7).

const PLUS_TEXT = "+2: You may discard a card. If you do, draw a card.";
const MINUS_TEXT = "−2: Exile target enchantment, tapped artifact, or tapped creature.";
const ULT_TEXT =
  "−8: Search your library for an artifact or creature card, put it onto the battlefield, then shuffle. It gains haste. Return it to your hand at the beginning of the next end step.";

export default defineCard({
  name: "Nahiri, the Harbinger",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nahiri"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
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
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "permanent",
          filter: {
            anyOf: [
              { type: "enchantment" },
              { type: "artifact", tapped: true },
              { type: "creature", tapped: true },
            ],
          },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { typesAnyOf: ["artifact", "creature"] },
            destination: "battlefield",
            min: 0,
            max: 1,
          },
          {
            kind: "grant-keyword-all",
            filter: { thisWay: "put-onto-battlefield" },
            keyword: "haste",
            duration: "permanent",
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "put-onto-battlefield",
            effect: { kind: "return-to-hand", target: 0 },
            text: "Return it to your hand.",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
