import { defineCard } from "../define.js";

// EDHREC rank 17419. The doubling is keyed on whose ability it is: another
// Wolf or a battle Chief's controller controls (`doubleTriggersOf`, `others`
// leaving Chief out). Each extra instance makes its own choices (the ruling).
//
// Rulings:
//   Chief of the Wilds's last ability doesn't copy the triggered ability; it just causes the
//     ability to trigger an additional time. Any choices made as you put the ability onto the
//     stack, such as modes and targets, are made separately for each instance of the ability.
//     Any choices made on resolution, such as whether to put counters on a permanent, are also
//     made individually.
const WOLF_TEXT = "Whenever another Wolf you control enters, put two +1/+1 counters on Chief of the Wilds.";
const DOUBLE_TEXT =
  "If a triggered ability of another Wolf or battle you control triggers, that ability triggers an additional time.";

export default defineCard({
  name: "Chief of the Wilds",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${WOLF_TEXT}\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Wolf" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: WOLF_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: {
        filter: { anyOf: [{ subtype: "Wolf" }, { type: "battle" }], controlledBy: "you" },
        others: true,
      },
      text: DOUBLE_TEXT,
    },
  ],
});
