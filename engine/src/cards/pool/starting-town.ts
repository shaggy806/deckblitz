import { defineCard } from "../define.js";
import { FIRST_THREE_TURNS } from "../helpers.js";

// EDHREC rank 703.
//
// "Your first, second, or third turn of the game" counts your own turns
// (`PlayerState.turnsTaken`), read as it's about to enter (rule 614.1c): on
// another player's turn it enters tapped however early that is.
const TAPPED_TEXT = "This land enters tapped unless it's your first, second, or third turn of the game.";

export default defineCard({
  name: "Starting Town",
  colors: [],
  types: ["land"],
  subtypes: ["Town"],
  text: `${TAPPED_TEXT}\n{T}: Add {C}.\n{T}, Pay 1 life: Add one mana of any color.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tappedUnless: FIRST_THREE_TURNS },
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Pay 1 life: Add one mana of any color.",
    },
  ],
});
