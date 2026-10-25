import { defineCard } from "../define.js";

// EDHREC rank 16116. "Devil Token" carries the dies trigger itself.

export default defineCard({
  name: "Devils' Playground",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: 'Create four 1/1 red Devil creature tokens. They have "When this token dies, it deals 1 damage to any target."',
  effect: { kind: "create-token", token: "Devil Token", count: 4 },
});
