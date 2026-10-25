import { defineCard } from "../define.js";

// EDHREC rank 10133. Any player's sacrifice of a creature, a cost's included
// (the rulings).

export default defineCard({
  name: "Mortician Beetle",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: "Whenever a player sacrifices a creature, you may put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "sacrifice", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Mortician Beetle?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever a player sacrifices a creature, you may put a +1/+1 counter on this creature.",
    },
  ],
});
