import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Worker",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "Modular 1 (This creature enters with a +1/+1 counter on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
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
      text: "Modular 1",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "Modular 1",
    },
  ],
});
