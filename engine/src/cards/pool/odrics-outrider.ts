import { defineCard } from "../define.js";

// EDHREC rank 20204.

export default defineCard({
  name: "Odric's Outrider",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 4,
  text: "Whenever this creature or another creature you control dies, put a +1/+1 counter on target creature you control.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature or another creature you control dies, put a +1/+1 counter on target creature you control.",
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever this creature or another creature you control dies, put a +1/+1 counter on target creature you control.",
    },
  ],
});
