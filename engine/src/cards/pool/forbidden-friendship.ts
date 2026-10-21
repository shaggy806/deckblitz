import { defineCard } from "../define.js";

// EDHREC rank 11542. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Forbidden Friendship",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create a 1/1 red Dinosaur creature token with haste and a 1/1 white Human Soldier creature token.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "1/1 Red Dinosaur Token (Haste)", count: 1 },
      { kind: "create-token", token: "Human Soldier Token", count: 1 },
    ],
  },
});
