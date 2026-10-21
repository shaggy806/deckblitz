import { defineCard } from "../define.js";

// −2 is Chandra, Acolyte of Flame's `cast-now`: cast while the ability
// resolves or not at all, its costs paid (alternative costs allowed — the
// rulings), and exiled instead of going to the graveyard. −8's free casts
// are a `player-effect` for the turn: they keep their normal timing (the
// ruling), and the seven drawn even with an empty hand.

const PLUS_TEXT = "+1: Chandra deals 3 damage to each opponent.";
const MINUS_TEXT =
  "−2: You may cast target red instant or sorcery card from your graveyard. If that spell would be put into your graveyard, exile it instead.";
const ULT_TEXT =
  "−8: Discard your hand, then draw seven cards. Until end of turn, you may cast spells from your hand without paying their mana costs.";

export default defineCard({
  name: "Chandra, Flame's Catalyst",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "each-opponent" },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { colors: ["R"], typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "cast-now", target: 0, exileAfter: true },
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
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 7 },
          { kind: "player-effect", duration: "end-of-turn", castFromHandFree: {} },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
