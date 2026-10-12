import { defineCard } from "../define.js";

export default defineCard({
  name: "Vibrant Idea",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw two cards.",
  effect: { kind: "draw", amount: 2 },
  prepareSpellOnly: true,
});
