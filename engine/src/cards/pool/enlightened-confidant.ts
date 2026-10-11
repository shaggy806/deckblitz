import { defineCard } from "../define.js";

// EDHREC rank 14337.
//
// Rulings:
//   [2026-08-21] Enlightened Confidant's ability checks at the moment it would trigger to see if
//     you gained life this turn. If you didn't, the ability won't trigger at all. Once your end
//     step begins, it's too late to gain life in order to cause this ability to trigger. However,
//     the last part of the ability will check how much life you've gained as the ability resolves,
//     so you could still gain more life while the ability is on the stack to make putting a card
//     into your hand easier.
//   [2026-08-21] If a card in your graveyard has an X in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// The surveil's `then` reads the card it put into the graveyard (`thisWay:
// "put-into-graveyard"`) and the life gained this turn as it resolves.

const TEXT =
  "At the beginning of your end step, if you gained life this turn, surveil 1. If you put a card with mana value " +
  "less than or equal to the amount of life you gained this turn into your graveyard this way, put that card into your hand.";

export default defineCard({
  name: "Enlightened Confidant",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "surveil",
        amount: 1,
        then: {
          kind: "return-from-graveyard",
          filter: {
            thisWay: "put-into-graveyard",
            manaValue: { op: "lte", n: { amount: { turnStat: "life-gained", who: "you" } } },
          },
          destination: "hand",
          count: "all",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
