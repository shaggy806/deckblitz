import { defineCard } from "../define.js";

// EDHREC rank 20846.

export default defineCard({
  name: "Parish-Blade Trainee",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\nWhen this creature dies, put its counters on target creature you control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self", withGreaterPower: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
      resolve: null,
      text: "Training",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: "When this creature dies, put its counters on target creature you control.",
    },
  ],
});
