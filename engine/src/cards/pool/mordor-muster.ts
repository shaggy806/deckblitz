import { defineCard } from "../define.js";

// EDHREC rank 7859.
// Makes Orc Army by amassing → the engine's "Army Token".

export default defineCard({
  name: "Mordor Muster",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw a card and you lose 1 life.\nAmass Orcs 1. (Put a +1/+1 counter on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "lose-life", amount: 1 },
      { kind: "amass", amount: 1, creatureType: "Orc" },
    ],
  },
});
