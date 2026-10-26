import { defineCard } from "../define.js";

// EDHREC rank 22373. Shards of Alara.
//
// The power is read once, as the creature enters (the trigger's filter —
// the ruling); the counters go on whatever it is by resolution.

export default defineCard({
  name: "Mighty Emergence",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Whenever a creature you control with power 5 or greater enters, you may put two +1/+1 counters on it.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 5 } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put two +1/+1 counters on it?",
        effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: "Whenever a creature you control with power 5 or greater enters, you may put two +1/+1 counters on it.",
    },
  ],
});
