import { defineCard } from "../define.js";

// EDHREC rank 21985. Animal Magnetism's shape: you choose the opponent, they
// choose from the revealed cards (`chooser: "that-player"`). look-and-choose
// has no graveyard destination, so the opponent's choice is put the other way
// round — they pick the cards that go to your hand, the rest going to your
// graveyard in the same move. Choosing which one card of three goes to the
// graveyard and choosing which two go to the hand are the same choice, so the
// count is one fewer than the cards revealed: 2 of 3; with fewer than three
// cards in your library, one fewer than all of them (none of one).

const TEXT =
  "Reveal the top three cards of your library. An opponent chooses one of them. Put that card into your graveyard and the rest into your hand.";

/** One fewer than the cards revealed: min(3, library) - 1, never below 0. */
const KEPT = {
  difference: [
    { ifCondition: { kind: "library-size", who: "you", atLeast: 3 }, then: 3, else: { librarySize: "you" } },
    1,
  ],
} as const;

export default defineCard({
  name: "Murmurs from Beyond",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-opponent",
    then: {
      kind: "look-and-choose",
      zone: "library",
      count: 3,
      reveal: true,
      chooser: "that-player",
      min: KEPT,
      max: KEPT,
      destination: "hand",
      leftover: "graveyard",
    },
  },
});
