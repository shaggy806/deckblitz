import { defineCard } from "../define.js";

// EDHREC rank 14165. The Hobbit (HOB).
//
// `reveal-until` with no fixed `put`: its `then` sends the card found by a
// compare on it, read as the ability resolves — a `conditional` on target 0's
// mana value against the lands you control, onto the battlefield or else into
// your hand (`return-to-hand` from the library, put rather than drawn). The
// rest go to the bottom in a random order; the trigger is `oncePerTurn`.
//
// Rulings:
//   [2026-06-29] If the revealed creature card has {X} in its mana cost, X is 0 for the purposes
//     of determining its mana value.

const TEXT =
  "Whenever a nontoken creature you control dies, reveal cards from the top of your library until you reveal a creature card. If its mana value is less than or equal to the number of lands you control, put it onto the battlefield. Otherwise, put it into your hand. Put the rest on the bottom of your library in a random order. This ability triggers only once each turn.";

export default defineCard({
  name: "Part in Friendship",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { type: "creature" },
        then: {
          kind: "conditional",
          condition: {
            kind: "target",
            index: 0,
            filter: { manaValue: { op: "lte", n: { amount: { countOf: { type: "land", controlledBy: "you" } } } } },
          },
          then: { kind: "put-onto-battlefield", target: 0 },
          else: { kind: "return-to-hand", target: 0, from: "library" },
        },
        rest: "bottom-random",
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
