import { defineCard } from "../define.js";

// EDHREC rank 8297.
//
// Rulings:
//   [2024-09-20] Irreverent Gremlin's second ability checks the power of the other creature only
//     at the moment that creature enters. If a creature enters with counters, those counters are
//     included. If a creature's power is 2 or less when it enters but becomes greater than 2 while
//     Irreverent Gremlin's second ability is still on the stack, you'll still have the choice to
//     discard a card when the ability resolves.

const LOOT =
  "Whenever another creature you control with power 2 or less enters, you may discard a card. If you do, draw a card. Do this only once each turn.";

export default defineCard({
  name: "Irreverent Gremlin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Gremlin"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${LOOT}`,
  triggered: [
    {
      // The power is read as the creature enters (the ruling) — a trigger
      // filter, not an intervening-if. "Do this only once each turn" limits
      // the loot, not the trigger: a turn it was declined doesn't count.
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", power: { op: "lte", n: 2 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        oncePerTurn: true,
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
      text: LOOT,
    },
  ],
});
