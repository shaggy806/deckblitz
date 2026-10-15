import { defineCard } from "../define.js";

// EDHREC rank 22560.
//
// "While it has a -1/-1 counter on it" is part of the trigger condition (rule
// 603.1), not an intervening "if" — Bristlebane Battler's `whileCondition`,
// checked only as it becomes tapped. It becomes tapped however it's tapped:
// attacking, a cost, an opponent's tap effect.
const ENTERS_TEXT = "This creature enters with three -1/-1 counters on it.";
const TRIGGER_TEXT =
  "Whenever this creature becomes tapped while it has a -1/-1 counter on it, remove a -1/-1 counter from it.";

export default defineCard({
  name: "Encumbered Reejerey",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 5,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 3 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      whileCondition: {
        kind: "source",
        filter: { counters: { kind: "-1/-1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
