import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, put a +1/+1 counter on target creature you control. If that creature is a Human, put two +1/+1 counters on it instead.";

export default defineCard({
  name: "Elder Cathar",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Human" } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
