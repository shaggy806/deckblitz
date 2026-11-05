import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

// EDHREC rank 17415. Each creature is its own source of the 1 damage
// (`each-deals-damage`), so deathtouch and lifelink apply.

const ENTER_TEXT = "When this Case enters, choose target creature you don't control. Each creature you control deals 1 damage to that creature.";
const SOLVE_TEXT = "To solve — Three or more creatures attacked this turn. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT = "Solved — Creatures you control get +1/+0.";

export default defineCard({
  name: "Case of the Gateway Express",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "each-deals-damage", filter: { type: "creature", controlledBy: "you" }, amount: 1, to: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve({ kind: "turn-stat", stat: "attackers", who: "any-player", atLeast: 3 }, SOLVE_TEXT),
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "solved" },
      grantPt: [1, 0],
      text: SOLVED_TEXT,
    },
  ],
});
