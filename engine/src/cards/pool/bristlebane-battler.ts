import { defineCard } from "../define.js";

// EDHREC rank 10817.
//
// "While this creature has a -1/-1 counter on it" is part of the trigger
// condition (rule 603.1), not an intervening "if": a `whileCondition`,
// checked only as the other creature enters. Removing a counter that's no
// longer there as it resolves does nothing.
const ENTERS_TEXT = "This creature enters with five -1/-1 counters on it.";
const TRIGGER_TEXT =
  "Whenever another creature you control enters while this creature has a -1/-1 counter on it, remove a -1/-1 counter from this creature.";

export default defineCard({
  name: "Bristlebane Battler",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample, ward {2}\n${ENTERS_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 5 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
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
