import { defineCard } from "../define.js";
import { caseToSolve } from "../helpers.js";

const ENTER_TEXT =
  "When this Case enters, distribute two +1/+1 counters among one or two target creatures you control.";
const SOLVE_TEXT =
  "To solve — Creatures you control have total power 8 or greater. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — Whenever you attack, put a +1/+1 counter on target attacking creature. It gains trample until end of turn.";

// The distribution is The Earth Crystal's: two targets get one each however
// they fare by resolution, one gets both.
export default defineCard({
  name: "Case of the Trampled Garden",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT}\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        "creature-you-control",
        { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slot: 0 } } },
      ],
      effect: {
        kind: "conditional",
        condition: { kind: "target-chosen", index: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          ],
        },
        else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve(
      {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      SOLVE_TEXT,
    ),
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      whileCondition: { kind: "solved" },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
