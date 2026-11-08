import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

// Solved's ability reaches the creature cards in the graveyard as it resolves (rule
// 611.2c), each cast for its own cost at its own timing this turn.
const ENTER_TEXT = "Whenever a creature you control enters, you gain 1 life.";
const SOLVE_TEXT = "To solve — You've gained 5 or more life this turn. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  'Solved — Sacrifice this Case: Creature cards in your graveyard gain "You may cast this card from your graveyard" until end of turn.';

export default defineCard({
  name: "Case of the Uneaten Feast",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve({ kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 5 }, SOLVE_TEXT),
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "solved" },
      targets: [],
      effect: { kind: "grant-play", cards: { filter: { type: "creature" } }, duration: "end-of-turn" },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
