import { defineCard } from "../define.js";

export default defineCard({
  name: "Elemental Summoning",
  manaCost: "{3}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create a 4/4 blue and red Elemental creature token.",
  effect: { kind: "create-token", token: "4/4 Blue Red Elemental Token", count: 1 },
});
