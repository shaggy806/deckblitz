import { defineCard } from "../define.js";

export default defineCard({
  name: "Inkling Summoning",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create a 2/1 white and black Inkling creature token with flying.",
  effect: { kind: "create-token", token: "Inkling Token", count: 1 },
});
