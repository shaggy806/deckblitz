import { defineCard } from "../define.js";

// EDHREC rank 1257.
// Rulings: searching the top four counts as searching that library; the whole
// library is shuffled after; finding one card doesn't bring a fifth into the
// search.

const SEARCH_TEXT = "If an opponent would search a library, that player searches the top four cards of that library instead.";

export default defineCard({
  name: "Aven Mindcensor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${SEARCH_TEXT}`,
  static: [{ affects: { scope: "self" }, opponentsSearchTop: { top: 4 }, text: SEARCH_TEXT }],
});
