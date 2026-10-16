import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

const ENTER_TEXT = "When this Case enters, discard a card, then draw two cards.";
const SOLVE_TEXT = "To solve — You have no cards in hand. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT = "Solved — At the beginning of your upkeep, discard your hand, then draw two cards.";

export default defineCard({
  name: "Case of the Crimson Pulse",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve({ kind: "hand-size", atMost: 0 }, SOLVE_TEXT),
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      whileCondition: { kind: "solved" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
