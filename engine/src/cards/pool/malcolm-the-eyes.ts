import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 7738.
//
// Jori En's `nthEachTurn: 2`: spells cast before Malcolm entered count (the
// ruling), so a Malcolm cast first makes the next spell the second.
const CAST_TEXT = "Whenever you cast your second spell each turn, investigate.";

export default defineCard({
  name: "Malcolm, the Eyes",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${CAST_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
