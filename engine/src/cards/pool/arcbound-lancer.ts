import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Lancer",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  keywords: ["first-strike"],
  text: "First strike\nModular 4 (This creature enters with four +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
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
      text: "Modular 4",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "Modular 4",
    },
  ],
});
