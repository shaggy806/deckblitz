import { defineCard } from "../define.js";

// EDHREC rank 9498. The power comparison is made after the first counter
// goes on (the ruling), and reads the entering creature as it last existed
// if it has left (Pelt Collector's dynamic compare on the trigger object).

const ENTERS_TEXT = "Yorvo enters with four +1/+1 counters on it.";
const TRIGGER_TEXT =
  "Whenever another green creature you control enters, put a +1/+1 counter on Yorvo. Then if that creature's power is greater than Yorvo's power, put another +1/+1 counter on Yorvo.";

export default defineCard({
  name: "Yorvo, Lord of Garenbrig",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Noble"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", colors: ["G"] }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "trigger-object",
              filter: { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
            },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
