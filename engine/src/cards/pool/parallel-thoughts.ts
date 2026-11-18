import { defineCard } from "../define.js";

// EDHREC rank 14469.
//
// The seven cards are exiled with this enchantment (rule 607.2a), face down
// with nobody allowed to look (rule 406.3; the ruling: "You can't look at the
// face down cards"), in a random order: the pile's top card is the first of
// them still in exile. "Seven cards" names no quality, so seven are found
// while there are seven (rule 701.23d); fewer, and all of them go (the
// ruling). Each draw asks whether to take the top card instead (rule 616.1),
// and taking it from an empty pile still replaces the draw (the ruling: "This
// allows you to skip draws"). A new Parallel Thoughts is a new object (rule
// 400.7) and reaches none of an old one's pile.
const ENTER_TEXT =
  "When this enchantment enters, search your library for seven cards, exile them in a face-down pile, and shuffle that pile. Then shuffle your library.";
const DRAW_TEXT = "If you would draw a card, you may instead put the top card of the pile you exiled into your hand.";

export default defineCard({
  name: "Parallel Thoughts",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {},
        destination: "exile-face-down",
        min: 7,
        max: 7,
        linked: true,
        faceDownLooks: "nobody",
        shufflePile: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          text: "put the top card of the pile you exiled into your hand",
          effect: { kind: "return-exiled-by-source", linked: "hand", top: 1 },
        },
        may: true,
      },
      text: DRAW_TEXT,
    },
  ],
});
