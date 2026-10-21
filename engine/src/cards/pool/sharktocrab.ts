import { defineCard } from "../define.js";

export default defineCard({
  name: "Sharktocrab",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Shark", "Octopus", "Crab"],
  power: 4,
  toughness: 4,
  text: "{2}{G}{U}: Adapt 1. (If this creature has no +1/+1 counters on it, put a +1/+1 counter on it.)\nWhenever one or more +1/+1 counters are put on this creature, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.",
  activated: [
    {
      cost: { mana: "{2}{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "{2}{G}{U}: Adapt 1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: "Whenever one or more +1/+1 counters are put on this creature, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.",
    },
  ],
});
