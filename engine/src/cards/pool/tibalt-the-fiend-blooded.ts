import { defineCard } from "../define.js";

const ALL = { type: "creature" } as const;

export default defineCard({
  name: "Tibalt, the Fiend-Blooded",
  manaCost: "{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tibalt"],
  loyalty: 2,
  text: "+1: Draw a card, then discard a card at random.\n−4: Tibalt deals damage equal to the number of cards in target player's hand to that player.\n−6: Gain control of all creatures until end of turn. Untap them. They gain haste until end of turn.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1, random: true },
        ],
      },
      resolve: null,
      text: "+1: Draw a card, then discard a card at random.",
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: ["player"],
      // Storm Seeker's shape: the hand is counted as it resolves (the ruling).
      effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
      resolve: null,
      text: "−4: Tibalt deals damage equal to the number of cards in target player's hand to that player.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      // Rowan, Fearless Sparkmage's ultimate: every creature untaps and gains
      // haste, those you already controlled too (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control-all", filter: ALL, untilEndOfTurn: true },
          { kind: "untap-all", filter: ALL },
          { kind: "grant-keyword-all", filter: ALL, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "−6: Gain control of all creatures until end of turn. Untap them. They gain haste until end of turn.",
    },
  ],
});
