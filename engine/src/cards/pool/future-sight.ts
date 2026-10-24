import { defineCard } from "../define.js";

// EDHREC rank 7457.
//
// The top card is public while this is out (rule 401.5); a land comes off the
// top with a land play, and a spell keeps its timing and its costs (the
// rulings). Nothing else of the top card — cycling, suspend, its abilities —
// is offered, since it isn't in the hand.
const PLAY_TEXT = "You may play lands and cast spells from the top of your library.";

export default defineCard({
  name: "Future Sight",
  manaCost: "{2}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Play with the top card of your library revealed.\n${PLAY_TEXT}`,
  revealsOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      playFromLibraryTop: { type: "land" },
      castFromLibraryTop: { filter: {} },
      text: PLAY_TEXT,
    },
  ],
});
