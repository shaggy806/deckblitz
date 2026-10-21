import { defineCard } from "../define.js";

// EDHREC rank 14358.

export default defineCard({
  name: "Honor the God-Pharaoh",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a card.\nDraw two cards. Amass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)",
  additionalCost: { discard: 1 },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "amass", amount: 1, creatureType: "Zombie" },
    ],
  },
});
