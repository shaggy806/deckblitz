import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";
import { caseToSolve } from "../helpers.js";

const ENTER_TEXT =
  "When this Case enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const SOLVE_TEXT =
  "To solve — There are five colors among permanents you control. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — At the beginning of combat on your turn, target creature you control gains flying, double strike, and vigilance until end of turn.";

// Five colors among your permanents is a permanent of each color: a
// multicolored one counts for every color it has.
const youControl = (color: "W" | "U" | "B" | "R" | "G"): StaticCondition => ({
  kind: "controls",
  filter: { colors: [color] },
  atLeast: 1,
});

export default defineCard({
  name: "Case of the Shattered Pact",
  manaCost: "{2}",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve(
      { kind: "all", of: [youControl("W"), youControl("U"), youControl("B"), youControl("R"), youControl("G")] },
      SOLVE_TEXT,
    ),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      whileCondition: { kind: "solved" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
