import { defineCard } from "../define.js";

// EDHREC rank 21765.
//
// Rulings:
//   [2025-04-04] If a card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//   [2025-04-04] Spells that were cast before a permanent with flurry count. If that permanent was
//     the first spell you cast that turn, the next spell you cast that turn is your second spell.

const ENTER_TEXT =
  "When this creature enters, return target nonland permanent card with mana value 2 or less from your graveyard to your hand.";
const FLURRY_TEXT = "Flurry — Whenever you cast your second spell each turn, tap target creature an opponent controls.";

export default defineCard({
  name: "Wayspeaker Bodyguard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Orc", "Monk"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\n${FLURRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
            notTypes: ["land"],
            manaValue: { op: "lte", n: 2 },
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: FLURRY_TEXT,
    },
  ],
});
