import { defineCard } from "../define.js";

// The five cards are exiled with this artifact (rule 607.2a), face down with
// nobody allowed to look (rule 406.3), in a random order: the pile's top card
// is the first of them still in exile. "Five cards" names no quality, so five
// are found while there are five (rule 701.23d). The activated ability's
// replacement remembers which pile it meant, so it still takes from it once
// the Tome has left the battlefield; with the pile empty it still replaces
// the draw, putting nothing anywhere. Several of them waiting: the player
// chooses which applies to each draw (rule 616.1).
const ENTER_TEXT =
  "When this artifact enters, search your library for five cards, exile them in a face-down pile, and shuffle that pile. Then shuffle your library.";
const DRAW_TEXT =
  "{2}: The next time you would draw a card this turn, instead put the top card of the exiled pile into its owner's hand.";

export default defineCard({
  name: "Mangara's Tome",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${ENTER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {},
        destination: "exile-face-down",
        min: 5,
        max: 5,
        linked: true,
        faceDownLooks: "nobody",
        shufflePile: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        replacement: {
          event: "would-draw",
          who: "you",
          instead: {
            effect: { kind: "return-exiled-by-source", linked: "hand", top: 1 },
            text: "Put the top card of the exiled pile into its owner's hand instead.",
          },
        },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
