import { defineCard } from "../define.js";

// EDHREC rank 8121.
//
// Rulings:
//   [2024-09-20] If the target creature is an illegal target when Vengeful Possession tries to
//     resolve, it won't resolve and none of its effects will happen. You won't have the option to
//     discard a card in order to draw a card.
//   [2024-09-20] Gaining control of a creature doesn't cause you to gain control of any Auras or
//     Equipment attached to it.
//   [2024-09-20] Vengeful Possession can target any creature, even one that's untapped or one you
//     already control.

export default defineCard({
  name: "Vengeful Possession",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap it. It gains haste until end of turn. You may discard a card. If you do, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "may",
        prompt: "Discard a card to draw a card?",
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
    ],
  },
});
