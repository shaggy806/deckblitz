import { defineCard } from "../define.js";

// EDHREC rank 17640.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Aven Eternal",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, amass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 1, creatureType: "Zombie" },
      resolve: null,
      text: "When this creature enters, amass Zombies 1.",
    },
  ],
});
