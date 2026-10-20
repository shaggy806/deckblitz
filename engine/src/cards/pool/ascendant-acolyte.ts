import { defineCard } from "../define.js";

// EDHREC rank 11227.
//
// Rulings:
//   [2022-02-18] If Ascendant Acolyte is entering the battlefield at the same time as other
//     creatures, it doesn't count any counters those other creatures would enter the battlefield
//     with.
//
// The count is a sum of +1/+1 counters over the creatures you control as it
// enters (rule 614.12); a creature entering beside it isn't on the
// battlefield yet, so its counters aren't counted (the ruling).

const ENTER_TEXT =
  "This creature enters with a +1/+1 counter on it for each +1/+1 counter among other creatures you control.";
const UPKEEP_TEXT = "At the beginning of your upkeep, double the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Ascendant Acolyte",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            aggregate: "sum",
            of: { counters: "+1/+1" },
            filter: { type: "creature", controlledBy: "you" },
            excludeSelf: true,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "double-counters", target: "source", counter: "+1/+1" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
