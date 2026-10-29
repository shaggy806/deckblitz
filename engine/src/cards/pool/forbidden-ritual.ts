import { defineCard } from "../define.js";

// EDHREC rank 25356.
// The opponent is targeted once, as it's cast, and every pass is against them (the rulings); you
// sacrifice as it resolves.

export default defineCard({
  name: "Forbidden Ritual",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Sacrifice a nontoken permanent. If you do, target opponent loses 2 life unless that player sacrifices a permanent of their choice or discards a card. You may repeat this process any number of times.",
  targets: ["opponent"],
  effect: {
    kind: "repeat",
    mayAgain: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "sacrifice", who: "you", filter: { token: false }, count: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
          then: {
            kind: "unless",
            chooser: 0,
            options: [
              { sacrifice: {}, text: "Sacrifice a permanent" },
              { discard: 1, text: "Discard a card" },
            ],
            otherwise: { kind: "lose-life", amount: 2, target: 0 },
          },
        },
      ],
    },
  },
});
