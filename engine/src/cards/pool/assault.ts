import { defineCard } from "../define.js";

// The left half of Assault // Battery (see assault-battery.ts).
const FACES = ["Assault // Battery", "Assault", "Battery"];

export default defineCard({
  name: "Assault",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Assault deals 2 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  faces: FACES,
  split: true,
});
