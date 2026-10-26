import { defineCard } from "../define.js";

// EDHREC rank 24638.

// Chandra, Flame's Fury's −2 shape: both damages dealt at once.
export default defineCard({
  name: "First Volley",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "First Volley deals 1 damage to target creature and 1 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "damage", amount: 1, toControllerOfTarget: 0 },
    ],
  },
});
