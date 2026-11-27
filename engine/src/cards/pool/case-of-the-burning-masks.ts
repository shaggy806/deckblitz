import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

// EDHREC rank 25855. The solve condition counts each source once however
// often it dealt damage (`turn-history` "dealt-damage", one per object and
// stint, rule 400.7), in the list of whoever controlled it as it dealt the
// damage — the Case itself, with its enter trigger, is one of them.
const ENTER_TEXT = "When this Case enters, it deals 3 damage to target creature an opponent controls.";
const SOLVE_TEXT =
  "To solve — Three or more sources you controlled dealt damage this turn. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — Sacrifice this Case: Exile the top three cards of your library. Choose one of them. You may play that card this turn.";

export default defineCard({
  name: "Case of the Burning Masks",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", target: 0, amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve({ kind: "turn-history", what: "dealt-damage", who: "you", atLeast: 3 }, SOLVE_TEXT),
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "solved" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 3, duration: "end-of-turn", play: true, choose: 1 },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
