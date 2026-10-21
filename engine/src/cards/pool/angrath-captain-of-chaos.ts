import { defineCard } from "../define.js";

// EDHREC rank 11510.
// Makes Zombie Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Angrath, Captain of Chaos",
  manaCost: "{2}{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Angrath"],
  loyalty: 5,
  text: "Creatures you control have menace.\n−2: Amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Zombie" },
      resolve: null,
      text: "−2: Amass Zombies 2.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["menace"],
      text: "Creatures you control have menace.",
    },
  ],
});
