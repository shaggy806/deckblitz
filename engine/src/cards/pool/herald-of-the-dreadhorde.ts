import { defineCard } from "../define.js";

// EDHREC rank 19040.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Herald of the Dreadhorde",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 3,
  toughness: 2,
  text: "When this creature dies, amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Zombie" },
      resolve: null,
      text: "When this creature dies, amass Zombies 2.",
    },
  ],
});
