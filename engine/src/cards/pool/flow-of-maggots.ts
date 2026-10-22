import { defineCard } from "../define.js";

// EDHREC rank 29530.
//
// Rulings:
//   [2008-10-01] Paying cumulative upkeep is always optional. If it's not paid, the permanent with
//     cumulative upkeep is sacrificed. Partial payments of the total cumulative upkeep cost can't
//     be made. For example, if a permanent with "cumulative upkeep {1}" has three age counters on
//     it when its cumulative upkeep ability triggers, it gets another age counter and then its
//     controller chooses to either pay {4} or sacrifice the permanent.

const CU_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const BLOCK_TEXT = "This creature can't be blocked by non-Wall creatures.";

export default defineCard({
  name: "Flow of Maggots",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: `${CU_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{1}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: CU_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notSubtypes: ["Wall"] },
      text: BLOCK_TEXT,
    },
  ],
});
