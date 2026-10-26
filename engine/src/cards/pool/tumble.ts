import { defineCard } from "../define.js";

const FACES = ["Rough // Tumble", "Rough", "Tumble"];

// The right half of Rough // Tumble (see rough-tumble.ts).
export default defineCard({
  name: "Tumble",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Tumble deals 6 damage to each creature with flying.",
  targets: [],
  effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 6 },
  faces: FACES,
  split: true,
});
