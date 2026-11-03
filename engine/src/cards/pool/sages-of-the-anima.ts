import { defineCard } from "../define.js";

// Alara Reborn. EDHREC rank 25655.
//
// The draw becomes the reveal (`would-draw` `instead: { effect }`, rule 614.11): applied though
// the library is empty, each draw of several replaced before the next. Every creature card
// revealed goes to hand — Garruk, Caller of Beasts's reveal-five shape.

const DRAW_TEXT =
  "If you would draw a card, instead reveal the top three cards of your library. Put all creature cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Sages of the Anima",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 3,
  toughness: 4,
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
            reveal: true,
            min: 3,
            max: 3,
            filter: { type: "creature" },
            destination: "hand",
            leftover: "bottom-any-order",
          },
        },
      },
      text: DRAW_TEXT,
    },
  ],
});
