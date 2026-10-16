import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

// EDHREC rank 22087.
//
// "To solve" counts every player's `descended` history — the permanent cards
// put into their graveyards from anywhere this turn (tokens aren't cards, the
// ruling) — narrowed to creature cards, read as cards rather than as the
// permanents they were (the ruling: a creature card that had become a
// noncreature permanent counts, a noncreature card animated on the
// battlefield doesn't). "Solved —" is a self static gated on the solved
// designation (rule 719.3c): it's a 4/4 Gorgon creature with deathtouch and
// lifelink in addition to its other types (layer 4, base P/T in 7b).

const ENTER_TEXT = "When this Case enters, destroy up to one target creature that was dealt damage this turn.";
const SOLVE_TEXT =
  "To solve — Three or more creature cards were put into graveyards from anywhere this turn. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — This Case is a 4/4 Gorgon creature with deathtouch and lifelink in addition to its other types.";

export default defineCard({
  name: "Case of the Gorgon's Kiss",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve(
      { kind: "turn-history", what: "descended", who: "any-player", filter: { type: "creature" }, atLeast: 3 },
      SOLVE_TEXT,
    ),
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "solved" },
      addTypes: ["creature"],
      addSubtypes: ["Gorgon"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["deathtouch", "lifelink"],
      text: SOLVED_TEXT,
    },
  ],
});
