import { defineCard } from "../define.js";

// EDHREC rank 8552.

const TEXT =
  "Whenever another creature you control dies, put a +1/+1 counter on Uglúk. If that creature was a Goblin or Orc, put two +1/+1 counters on Uglúk instead.";

// "Was a Goblin or Orc": the trigger object read as it last existed on the
// battlefield (rule 608.2h — the `trigger-object` condition's LKI).
export default defineCard({
  name: "Uglúk of the White Hand",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { subtypes: ["Goblin", "Orc"] } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        else: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
