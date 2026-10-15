import { defineCard } from "../define.js";

// EDHREC rank 22566.
//
// Rulings:
//   [2025-11-17] If Reluctant Dounguard enters at the same time as one or more other creatures you
//     control, its last ability will trigger for each of those creatures (unless it somehow entered
//     without -1/-1 counters on it.)
//
// Bristlebane Battler's two abilities, word for word: the counters are put on
// as it enters (a replacement, rule 614.1c), so it already has them when it
// looks at creatures entering beside it.
const ENTERS_TEXT = "This creature enters with two -1/-1 counters on it.";
const TRIGGER_TEXT =
  "Whenever another creature you control enters while this creature has a -1/-1 counter on it, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Reluctant Dounguard",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 4,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
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
