import { defineCard } from "../define.js";

// Zendikar Rising (ZNR). "If you didn't put a card into your hand this way"
// is the `"put-into-hand"` this-way kind with `atMost: 0` — taking nothing
// and finding no creature both leave it true.
//
// Rulings:
//   [2020-09-25] If you draw a card this way, that card is the next one in your library after
//     putting the five cards from the top of your library on the bottom.

const TEXT =
  "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, draw a card.";

export default defineCard({
  name: "Adventure Awaits",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-random",
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
