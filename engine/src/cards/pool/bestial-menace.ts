import { defineCard } from "../define.js";

// EDHREC rank 18903.

export default defineCard({
  name: "Bestial Menace",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 1/1 green Snake creature token, a 2/2 green Wolf creature token, and a 3/3 green Elephant creature token.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "create-token", token: "Snake Token", count: 1 },
      { kind: "create-token", token: "Wolf Token", count: 1 },
      { kind: "create-token", token: "Elephant Token", count: 1 },
    ],
  },
});
