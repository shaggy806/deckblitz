import { defineCard } from "../define.js";

// EDHREC rank 7807. March of the Machine.
//
// The second mode's count is chosen as it resolves, and may be none — just
// the one draw (the ruling); Valakut Awakening's shape.

export default defineCard({
  name: "Into the Fire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Choose one —\n" +
    "• Into the Fire deals 2 damage to each creature, planeswalker, and battle.\n" +
    "• Put any number of cards from your hand on the bottom of your library, then draw that many cards plus one.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Into the Fire deals 2 damage to each creature, planeswalker, and battle.",
        effect: { kind: "damage-all", amount: 2, filter: { typesAnyOf: ["creature", "planeswalker", "battle"] } },
      },
      {
        text: "Put any number of cards from your hand on the bottom of your library, then draw that many cards plus one.",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "hand",
              min: 0,
              max: { cardsInHand: "you" },
              destination: "library-bottom",
              leftover: "stay",
            },
            { kind: "draw", amount: { sum: [{ thisWay: "put-on-bottom", who: "you" }, 1] } },
          ],
        },
      },
    ],
  },
});
