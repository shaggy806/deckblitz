import { defineCard } from "../define.js";

// EDHREC rank 11488.
//
// Rulings:
//   [2019-10-04] If replacement effects cause you to draw five or more cards while resolving the
//     last ability of The Royal Scions, its reflexive triggered ability still triggers only once.
//   [2019-10-04] The Royal Scions's last ability goes on the stack without a target. While that
//     ability is resolving, you draw four cards. When you do, the reflexive triggered ability
//     triggers and you pick a target to be dealt damage.
//   [2019-10-04] If you draw fewer than four cards while resolving the last ability of The Royal
//     Scions, its reflexive triggered ability doesn't trigger.
//
// The reflexive trigger waits on four cards drawn this way (rule 603.12), and
// reads the hand as it resolves.

const LOOT_TEXT = "+1: Draw a card, then discard a card.";
const PUMP_TEXT = "+1: Target creature gets +2/+0 and gains first strike and trample until end of turn.";
const ULT_TEXT =
  "−8: Draw four cards. When you do, The Royal Scions deals damage to any target equal to the number of cards in your hand.";

export default defineCard({
  name: "The Royal Scions",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Will", "Rowan"],
  loyalty: 5,
  text: `${LOOT_TEXT}\n${PUMP_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 4 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "drawn", atLeast: 4 },
            then: {
              kind: "reflexive-trigger",
              targets: ["any-target"],
              effect: { kind: "damage", amount: { cardsInHand: "you" }, target: 0 },
              text: "When you do, The Royal Scions deals damage to any target equal to the number of cards in your hand.",
            },
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
