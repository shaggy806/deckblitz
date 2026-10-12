import { defineCard } from "../define.js";

export default defineCard({
  name: "Needletooth Pack",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 5,
  text: "Morbid — At the beginning of your end step, if a creature died this turn, put two +1/+1 counters on target creature you control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Morbid — At the beginning of your end step, if a creature died this turn, put two +1/+1 counters on target creature you control.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
