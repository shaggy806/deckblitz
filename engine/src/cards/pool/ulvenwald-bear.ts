import { defineCard } from "../define.js";

export default defineCard({
  name: "Ulvenwald Bear",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bear"],
  power: 2,
  toughness: 2,
  text: "Morbid — When this creature enters, if a creature died this turn, put two +1/+1 counters on target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Morbid — When this creature enters, if a creature died this turn, put two +1/+1 counters on target creature.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
