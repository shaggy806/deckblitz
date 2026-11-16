import { defineCard } from "../define.js";

// EDHREC rank 3632.
//
// +1: the draw, then each opponent in turn order chooses a card in their hand
// (unrevealed) or a permanent they control, knowing the choices before
// theirs, and all of them are exiled at once (its ruling, rule 101.4) — the
// `exile-from-zones` effect. Triggers on the draw wait until it's done.
// −8: "a legendary creature or planeswalker" is a legendary creature or a
// legendary planeswalker (the same words read so in rule 205.4e).

const STATIC_TEXT = "Nicol Bolas has all loyalty abilities of all other planeswalkers on the battlefield.";
const PLUS_TEXT = "+1: You draw a card. Each opponent exiles a card from their hand or a permanent they control.";
const MINUS_TEXT = "−3: Destroy target creature or planeswalker.";
const ULT_TEXT = "−8: Each opponent who doesn't control a legendary creature or planeswalker loses the game.";

export default defineCard({
  name: "Nicol Bolas, Dragon-God",
  manaCost: "{U}{B}{B}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Bolas"],
  loyalty: 4,
  text: `${STATIC_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "exile-from-zones", who: "each-opponent", zones: ["hand", "battlefield"], count: 1 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        whoIf: {
          kind: "not",
          of: {
            kind: "of-player",
            player: "that-player",
            condition: {
              kind: "controls",
              filter: { supertype: "legendary", typesAnyOf: ["creature", "planeswalker"] },
              atLeast: 1,
            },
          },
        },
        effect: { kind: "lose-game", who: "that-player" },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "battlefield", filter: { type: "planeswalker" }, only: "loyalty" },
      text: STATIC_TEXT,
    },
  ],
});
