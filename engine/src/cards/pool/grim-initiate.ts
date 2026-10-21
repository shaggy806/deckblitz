import { defineCard } from "../define.js";

// EDHREC rank 16307.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Grim Initiate",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nWhen this creature dies, amass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Zombie" },
      resolve: null,
      text: "When this creature dies, amass Zombies 1.",
    },
  ],
});
