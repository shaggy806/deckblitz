import { defineCard } from "../define.js";

// EDHREC rank 8319.
//
// Rulings:
//   If a permanent card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// "With a counter on it" is any counter of any kind; "the number of counters
// on that creature" is every counter it died with (`countersOn` reads the
// trigger object as it last existed, rule 608.2h). "Another" is a card other
// than the creature that died. The target is chosen as the trigger goes on
// the stack; "do this only once each turn" limits the return, not the
// trigger (Krile Baldesion's `may` with `oncePerTurn`).

const TEXT =
  "Whenever a creature you control with a counter on it dies, you may return another target permanent card with mana value less than or equal to the number of counters on that creature from your graveyard to your hand. Do this only once each turn.";

export default defineCard({
  name: "Puca's Covenant",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [
        {
          kind: "other",
          than: "trigger-object",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
              manaValue: { op: "lte", n: { amount: { countersOn: "trigger-object" } } },
            },
          },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return that permanent card from your graveyard to your hand?",
        oncePerTurn: true,
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
