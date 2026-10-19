import { defineCard } from "../define.js";

// EDHREC rank 22094.

export default defineCard({
  name: "Brokers Veteran",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, put a shield counter on target creature you control. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
      resolve: null,
      text: "When this creature dies, put a shield counter on target creature you control.",
    },
  ],
});
