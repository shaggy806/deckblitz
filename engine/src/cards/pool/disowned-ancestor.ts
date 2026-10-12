import { defineCard } from "../define.js";

export default defineCard({
  name: "Disowned Ancestor",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 0,
  toughness: 4,
  text: "Outlast {1}{B} ({1}{B}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Outlast {1}{B}",
    },
  ],
});
