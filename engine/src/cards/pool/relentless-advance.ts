import { defineCard } from "../define.js";

// EDHREC rank 21383.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Relentless Advance",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Amass Zombies 3. (Put three +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  effect: { kind: "amass", amount: 3, creatureType: "Zombie" },
});
