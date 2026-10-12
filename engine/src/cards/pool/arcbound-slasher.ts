import { defineCard } from "../define.js";

export default defineCard({
  name: "Arcbound Slasher",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Cat"],
  power: 0,
  toughness: 0,
  keywords: ["riot"],
  text: "Modular 4 (This creature enters with four +1/+1 counters on it. When it dies, you may put its +1/+1 counters on target artifact creature.)\nRiot (This creature enters with your choice of an additional +1/+1 counter or haste.)",
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
