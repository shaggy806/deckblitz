import { defineCard } from "../define.js";

// EDHREC rank 9445.

export default defineCard({
  name: "Ral's Reinforcements",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Create two 1/1 blue and red Elemental creature tokens.",
  effect: { kind: "create-token", token: "Elemental Token (Prismari Pianist)", count: 2 },
});
