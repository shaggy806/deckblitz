import { defineCard } from "../define.js";

export default defineCard({
  name: "Salt Road Patrol",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 5,
  text: "Outlast {1}{W} ({1}{W}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Outlast {1}{W}",
    },
  ],
});
