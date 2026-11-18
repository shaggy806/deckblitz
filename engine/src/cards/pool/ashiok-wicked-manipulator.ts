import { defineCard } from "../define.js";

// EDHREC rank 14563.
//
// The first ability is a replacement of every life payment of yours — a cost's,
// Phyrexian mana's, an effect's "pay N life" — while your library holds that many
// cards (rule 614.1a): no life is paid or lost, the cards are exiled instead, and
// the payment still counts as made. It isn't optional, can't be split, and lets you
// pay no more life than you have (the rulings).
//
// The −7's X counts every card you own in exile, face down ones at 0 (rule
// 406.3a), as it resolves.

const REPLACE_TEXT =
  "If you would pay life while your library has at least that many cards in it, exile that many cards from the top of your library instead.";
const LOOK_TEXT = "+1: Look at the top two cards of your library. Exile one of them and put the other into your hand.";
const TOKENS_TEXT =
  '−2: Create two 1/1 black Nightmare creature tokens with "At the beginning of combat on your turn, if a card was put into exile this turn, put a +1/+1 counter on this token."';
const ULT_TEXT =
  "−7: Target player exiles the top X cards of their library, where X is the total mana value of cards you own in exile.";

export default defineCard({
  name: "Ashiok, Wicked Manipulator",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ashiok"],
  loyalty: 5,
  text: `${REPLACE_TEXT}\n${LOOK_TEXT}\n${TOKENS_TEXT}\n${ULT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-pay-life",
        who: "you",
        whileLibraryHasThatMany: true,
        instead: { effect: { kind: "exile-from-library", whose: "you", amount: "x" } },
      },
      text: REPLACE_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "exile",
        leftover: "hand",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Nightmare Token (Ashiok, Wicked Manipulator)", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "exile-from-library",
        whose: 0,
        amount: { aggregate: "sum", of: "mana-value", filter: { ownedBy: "you" }, in: "exile" },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
