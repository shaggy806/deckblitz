import { defineCard } from "../define.js";

// EDHREC rank 5890. +1: every player discards at once; an opponent with no
// card to discard loses 3 life — you with none just don't discard (the
// rulings). −3's X is counted as it resolves. The emblem's creature gains
// haste indefinitely (the ruling).
const PLUS_TEXT = "+1: Each player discards a card. Each opponent who can't loses 3 life.";
const MINUS_TEXT = "−3: Target creature gets -X/-X until end of turn, where X is the number of cards in your graveyard.";
const EMBLEM =
  "At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.";
const ULTIMATE = `−7: You get an emblem with "${EMBLEM}"`;
const MINUS_X = { product: [{ graveyardSize: "you" }, -1] } as const;

export default defineCard({
  name: "Liliana, Waker of the Dead",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-player", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", who: "that-player", atMost: 0 },
              then: { kind: "lose-life", amount: 3, who: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      resolve: null,
      text: MINUS_TEXT,
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
            trigger: { on: "step-begins", step: "begin-combat", who: "you" },
            targets: [{ kind: "card-in-graveyard", filter: { type: "creature" } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "put-onto-battlefield", target: 0, underYourControl: true },
                { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
              ],
            },
            resolve: null,
            text: EMBLEM,
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
