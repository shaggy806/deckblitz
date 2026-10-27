import { defineCard } from "../define.js";

// The right half of Assault // Battery (see assault-battery.ts).
const FACES = ["Assault // Battery", "Assault", "Battery"];

export default defineCard({
  name: "Battery",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Elephant creature token.",
  effect: { kind: "create-token", token: "Elephant Token", count: 1 },
  faces: FACES,
  split: true,
});
