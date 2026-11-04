import { defineCard } from "../define.js";
import { FIRST_THREE_TURNS } from "../helpers.js";

// EDHREC rank 11555.
//
// "You can't cast" counts your own turns; on another player's turn, with flash
// from somewhere, it's castable (the card's ruling).
export default defineCard({
  name: "Serra Avenger",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "You can't cast Serra Avenger during your first, second, or third turns of the game.\nFlying, vigilance",
  castOnlyIf: { kind: "not", of: FIRST_THREE_TURNS },
});
