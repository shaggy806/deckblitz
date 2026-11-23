import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2): Chains of Mephistopheles on a creature,
// its replacement word for word (see that card's notes and these rulings):
// each card of a longer draw is replaced one at a time; a player with cards in
// hand discards one and then draws, one with none mills a card instead.
const TEXT =
  "If a player would draw a card except the first one they draw in each of their draw steps, that player discards a card instead. If the player discards a card this way, they draw a card. If the player doesn't discard a card this way, they mill a card.";

export default defineCard({
  name: "Magus of the Chains",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
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
