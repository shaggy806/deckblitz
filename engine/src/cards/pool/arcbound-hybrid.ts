import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Hybrid",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  keywords: ["haste"],
  text: "Haste\nModular 2 (This creature enters with two +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "may",
        prompt: "Put this creature's +1/+1 counters on target artifact creature?",
        effect: {
          kind: "add-counter",
          target: 0,
          counter: "+1/+1",
          amount: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: "Modular 2",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "Modular 2",
    },
  ],
});
