import { defineCard } from "../define.js";

// EDHREC rank 11305.
//
// Every player's draw but the first in each of their own draw steps, a draw
// as a cost included (the rulings): the draw becomes the effect (rule
// 614.1a), whoever's it is ("trigger-player"), and its player chooses the
// card to discard. The card it then has them draw is a new draw event that
// this Chains can't replace again (rule 614.5) but another can — so with two
// out, each makes the player discard first, and once one mills instead
// there's no draw left for the next to replace (the rulings). All of it is
// done before the next card of a longer draw (614.11a).

const TEXT =
  "If a player would draw a card except the first one they draw in each of their draw steps, that player discards a card instead. If the player discards a card this way, they draw a card. If the player doesn't discard a card this way, they mill a card.";

export default defineCard({
  name: "Chains of Mephistopheles",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "any-player",
        exceptFirstInDrawStep: true,
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "trigger-player", amount: 1 },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "discarded" },
                then: { kind: "draw", amount: 1, who: "trigger-player" },
                else: { kind: "mill", target: "trigger-player", amount: 1 },
              },
            ],
          },
        },
      },
      text: TEXT,
    },
  ],
});
