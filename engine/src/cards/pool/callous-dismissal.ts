import { defineCard } from "../define.js";

// EDHREC rank 14361.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Callous Dismissal",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target nonland permanent to its owner's hand.\nAmass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "amass", amount: 1, creatureType: "Zombie" },
    ],
  },
});
