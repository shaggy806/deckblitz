import { defineCard } from "../define.js";

// EDHREC rank 30479.
//
// Rulings:
//   [2021-09-24] The card you don't put into your graveyard stays on top of your library.
//   [2021-09-24] A triggered ability that triggers whenever day becomes night or night becomes
//     day only triggers if it was already either day or night and becomes the other.
//
// Soulcipher Board's shape: the card kept is the choice (back on top), the
// other goes to the graveyard; with one card left in the library, that one
// goes to the graveyard.

const CHANGE_TEXT =
  "Whenever day becomes night or night becomes day, look at the top two cards of your library. Put one of them " +
  "into your graveyard.";

export default defineCard({
  name: "Celestus Sanctifier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 2,
  becomesDayAsEnters: true,
  text: `If it's neither day nor night, it becomes day as this creature enters.\n${CHANGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: { ifCondition: { kind: "library-size", who: "you", atLeast: 2 }, then: 1, else: 0 },
        max: { ifCondition: { kind: "library-size", who: "you", atLeast: 2 }, then: 1, else: 0 },
        destination: "library-top",
        leftover: "graveyard",
      },
      resolve: null,
      text: CHANGE_TEXT,
    },
  ],
});
