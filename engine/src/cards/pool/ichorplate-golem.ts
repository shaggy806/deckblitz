import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 19755.
// Rulings: the trigger looks at the counters it entered with (an intervening
// if, checked again as it resolves — rule 603.4); the anthem is +1/+1 for one
// or more oil counters, not per counter.

const ENTER_TEXT =
  "Whenever a creature you control enters, if it has one or more oil counters on it, put an oil counter on it.";
const ANTHEM_TEXT = "Creatures you control with oil counters on them get +1/+1.";

const OILED: CardFilter = { type: "creature", counters: { kind: "oil", compare: { op: "gte", n: 1 } } };

export default defineCard({
  name: "Ichorplate Golem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Golem"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: OILED },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: OILED },
        then: { kind: "add-counter", target: "trigger-object", counter: "oil", amount: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { ...OILED, controlledBy: "you" } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
