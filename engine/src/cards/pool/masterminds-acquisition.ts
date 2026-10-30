import { defineCard } from "../define.js";

// EDHREC rank 8685. Commander 2016.
//
// The second mode takes a card from the caster's sideboard (rule 400.11a),
// unrevealed ("put", not "reveal"); in a Commander game there is none
// (903.5e), so only the tutor finds anything there.

const TUTOR = "Search your library for a card, put it into your hand, then shuffle.";
const WISH = "Put a card you own from outside the game into your hand.";

export default defineCard({
  name: "Mastermind's Acquisition",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Choose one —\n• ${TUTOR}\n• ${WISH}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: TUTOR,
        targets: [],
        // "A card", no quality: one must be found while there is one (701.23d).
        effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
      },
      {
        text: WISH,
        targets: [],
        effect: { kind: "search-library", filter: {}, destination: "hand", min: 0, max: 1, outside: "only" },
      },
    ],
  },
});
