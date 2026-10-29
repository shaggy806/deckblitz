import { defineCard } from "../define.js";

const FACES = ["Discovery // Dispersal", "Discovery", "Dispersal"];
const DISCOVERY_TEXT =
  "Surveil 2, then draw a card. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";
const DISPERSAL_TEXT =
  "Each opponent returns a nonland permanent they control with the greatest mana value among permanents they control to its owner's hand, then discards a card.";

// EDHREC rank 10241.
//
// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (discovery.ts, dispersal.ts).
export default defineCard({
  name: "Discovery // Dispersal",
  manaCost: "{1}{U/B}{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery", "instant"],
  text: `${DISCOVERY_TEXT}\n//\n${DISPERSAL_TEXT}`,
  faces: FACES,
  split: true,
});
