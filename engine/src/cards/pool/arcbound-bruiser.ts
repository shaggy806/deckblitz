import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Bruiser",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: "Modular 3 (This creature enters with three +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
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
      text: "Modular 3",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "Modular 3",
    },
  ],
});
