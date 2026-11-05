import { defineCard } from "../define.js";

// EDHREC rank 13668.
//
// Rulings:
//   [2021-04-16] Effects that increase or decrease costs are applied after you choose the value of
//     X, and will not impact the results of the spell.
//   [2021-04-16] If an effect allows you to cast Multiple Choice without paying its mana cost, you
//     must choose 0 as the value of X. Cheating on tests is frowned upon.
//   [2021-04-16] You can choose 0 as the value of X as you cast Multiple Choice, but it will have
//     no effect when it resolves.
//   [2021-04-16] Multiple Choice doesn't have any targets.

const orFour = (n: number) =>
  ({
    kind: "any",
    of: [
      { kind: "x", compare: { op: "eq", n } },
      { kind: "x", compare: { op: "gte", n: 4 } },
    ],
  }) as const;

export default defineCard({
  name: "Multiple Choice",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "If X is 1, scry 1, then draw a card.\nIf X is 2, you may choose a player. They return a creature they control to its owner's hand.\nIf X is 3, create a 4/4 blue and red Elemental creature token.\nIf X is 4 or more, do all of the above.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: orFour(1),
        then: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
      },
      {
        kind: "conditional",
        condition: orFour(2),
        then: {
          kind: "may",
          prompt: "Choose a player to return a creature they control to its owner's hand?",
          effect: {
            kind: "choose-opponent",
            anyPlayer: true,
            then: {
              kind: "as-player",
              who: "that-player",
              effect: {
                kind: "choose-permanents",
                filter: { type: "creature", controlledBy: "you" },
                min: 1,
                upTo: 1,
                then: { kind: "return-to-hand", target: 0 },
                prompt: "Return a creature you control to its owner's hand",
              },
            },
          },
        },
      },
      {
        kind: "conditional",
        condition: orFour(3),
        then: { kind: "create-token", token: "4/4 Blue Red Elemental Token", count: 1 },
      },
    ],
  },
});
