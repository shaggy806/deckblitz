import { defineCard } from "../define.js";

// EDHREC rank 20656.
// Makes Minotaur → new token "2/3 Red Minotaur Token (Haste)".

export default defineCard({
  name: "Flurry of Horns",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create two 2/3 red Minotaur creature tokens with haste.",
  effect: { kind: "create-token", token: "2/3 Red Minotaur Token (Haste)", count: 2 },
});
