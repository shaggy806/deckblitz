import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

// EDHREC rank 2821.
//
// "To solve" counts the instant and sorcery spells you've cast this turn,
// each as it was cast (`cast-this-turn` — a copy isn't cast); "Solved —" is
// the draw trigger gated on the solved designation (rule 719.3c — a
// `whileCondition`: it doesn't trigger at all while unsolved).

const REDUCE_TEXT = "Instant and sorcery spells you cast cost {1} less to cast.";
const SOLVE_TEXT =
  "To solve — You've cast four or more instant and sorcery spells this turn. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT = "Solved — Whenever you cast an instant or sorcery spell, draw a card.";

export default defineCard({
  name: "Case of the Ransacked Lab",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${REDUCE_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, caster: "you", reduceGeneric: 1 },
      text: REDUCE_TEXT,
    },
  ],
  triggered: [
    caseToSolve(
      { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] }, atLeast: 4 },
      SOLVE_TEXT,
    ),
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      whileCondition: { kind: "solved" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
