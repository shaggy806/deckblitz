import { defineCard } from "../define.js";

// EDHREC rank 24451.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Invading Manticore",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Manticore"],
  power: 4,
  toughness: 5,
  text: "When this creature enters, amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Zombie" },
      resolve: null,
      text: "When this creature enters, amass Zombies 2.",
    },
  ],
});
