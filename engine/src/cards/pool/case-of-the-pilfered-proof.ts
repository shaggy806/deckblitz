import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

const COUNTER_TEXT = "Whenever a Detective you control enters or is turned face up, put a +1/+1 counter on it.";
const SOLVE_TEXT =
  "To solve — You control three or more Detectives. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — If one or more tokens would be created under your control, those tokens plus a Clue token are created instead. (It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Case of the Pilfered Proof",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${COUNTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Detective" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { subtype: "Detective" } },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    caseToSolve({ kind: "controls", filter: { subtype: "Detective" }, atLeast: 3 }, SOLVE_TEXT),
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "solved" },
      replacement: { event: "would-create-token", plusOneToken: "Clue Token" },
      text: SOLVED_TEXT,
    },
  ],
});
