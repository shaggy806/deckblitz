import { defineCard } from "../define.js";

// The half of Cut // Ribbons cast from the hand.
const FACES = ["Cut // Ribbons", "Cut", "Ribbons"];

export default defineCard({
  name: "Cut",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Cut deals 4 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
  faces: FACES,
  split: true,
});
