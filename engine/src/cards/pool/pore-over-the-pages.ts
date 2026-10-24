import { defineCard } from "../define.js";

// EDHREC rank 12990.
//
// Rulings:
//   [2016-04-08] You choose which lands to untap after you have drawn three cards. Lands
//     controlled by any player may be untapped this way.

export default defineCard({
  name: "Pore Over the Pages",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw three cards, untap up to two lands, then discard a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "choose-permanents",
        filter: { type: "land" },
        upTo: 2,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to two lands",
      },
      { kind: "discard", target: "you", amount: 1 },
    ],
  },
});
