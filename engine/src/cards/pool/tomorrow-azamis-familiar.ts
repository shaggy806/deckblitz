import { defineCard } from "../define.js";

// Saviors of Kamigawa. EDHREC rank 18052.
//
// The draw becomes the look (`would-draw` `instead: { effect }`, rule 614.11): applied though
// the library is empty, each draw of several replaced and answered before the next.

const DRAW_TEXT =
  "If you would draw a card, look at the top three cards of your library instead. Put one of those cards into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Tomorrow, Azami's Familiar",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 5,
  text: DRAW_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          effect: {
            kind: "look-and-choose",
            zone: "library",
            count: 3,
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "bottom-any-order",
          },
        },
      },
      text: DRAW_TEXT,
    },
  ],
});
