import { defineCard } from "../define.js";

export default defineCard({
  name: "Pest Summoning",
  manaCost: "{1}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create two 1/1 black and green Pest creature tokens with \"When this token dies, you gain 1 life.\"",
  targets: [],
  effect: { kind: "create-token", token: "Pest Token", count: 2 },
});
