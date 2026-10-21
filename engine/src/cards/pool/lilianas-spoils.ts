import { defineCard } from "../define.js";

// EDHREC rank 21077.
//
// Rulings:
//   It may target an opponent with no cards in hand; you still look.

const DISCARD_TEXT = "Target opponent discards a card.";
const LOOK_TEXT =
  "Look at the top five cards of your library. You may reveal a black card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Liliana's Spoils",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${DISCARD_TEXT}\n${LOOK_TEXT}`,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 1 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { colors: ["B"] },
        destination: "hand",
        leftover: "bottom-random",
      },
    ],
  },
});
