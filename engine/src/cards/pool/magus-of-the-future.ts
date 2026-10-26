import { defineCard } from "../define.js";

// EDHREC rank 14448.
//
// Future Sight on a body: the top card is public while this is out (rule
// 401.5); a land comes off the top with a land play, and a spell keeps its
// timing and its costs (the rulings).
const PLAY_TEXT = "You may play lands and cast spells from the top of your library.";

export default defineCard({
  name: "Magus of the Future",
  manaCost: "{2}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
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
