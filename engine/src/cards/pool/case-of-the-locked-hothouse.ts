import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

const LAND_TEXT = "You may play an additional land on each of your turns.";
const SOLVE_TEXT = "To solve — You control seven or more lands. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — You may look at the top card of your library any time, and you may play lands and cast creature and enchantment spells from the top of your library.";

// Solved, a static (its ruling): the look and both permissions come and go
// with the Case being solved, so the look is a conditional `visibility` static
// rather than the card-level `looksAtOwnLibraryTop`.
export default defineCard({
  name: "Case of the Locked Hothouse",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${LAND_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  static: [
    { affects: { scope: "self" }, extraLandsPerTurn: 1, text: LAND_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "solved" },
      visibility: { looksAtOwnLibraryTop: true },
      mayPlay: { from: "library-top", play: true, spell: { typesAnyOf: ["creature", "enchantment"] } },
      text: SOLVED_TEXT,
    },
  ],
  triggered: [caseToSolve({ kind: "controls", filter: { type: "land" }, atLeast: 7 }, SOLVE_TEXT)],
});
