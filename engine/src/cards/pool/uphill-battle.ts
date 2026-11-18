import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 14908.
//
// "Played" is the old wording for cast, and for a land played (rule 305.1): a
// creature spell an opponent cast (`castBy: "opponent"`, who cast it rather
// than who controls it as it enters), or a creature land an opponent played
// (Dryad Arbor — it enters under the player who played it). A creature an
// opponent put onto the battlefield some other way wasn't played, so it
// enters untapped. Judged as the creature would exist on the battlefield
// (rule 614.12), how it got there included.
const TEXT = "Creatures played by your opponents enter tapped.";

export default defineCard({
  name: "Uphill Battle",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: {
          type: "creature",
          anyOf: [{ castBy: "opponent" }, { played: true, controlledBy: "opponent" }],
        },
        tapped: true,
      },
      text: TEXT,
    },
  ],
});
