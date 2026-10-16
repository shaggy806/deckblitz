import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, surveil 1.";
const SOLVE_TEXT =
  "To solve — There are fifteen or more cards in your graveyard. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT = "Solved — Whenever you cast a nonlegendary creature spell, copy that spell.";

// The copy of a permanent spell resolves into a token (rule 707.10f); it
// isn't cast, so it doesn't trigger this again (the rulings).
export default defineCard({
  name: "Case of the Shifting Visage",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${UPKEEP_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT} (The copy becomes a token.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    caseToSolve({ kind: "cards-in-graveyard", atLeast: 15 }, SOLVE_TEXT),
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", notSupertype: "legendary" } },
      whileCondition: { kind: "solved" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell" },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
