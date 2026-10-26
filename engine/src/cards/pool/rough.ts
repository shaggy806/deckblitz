import { defineCard } from "../define.js";

const FACES = ["Rough // Tumble", "Rough", "Tumble"];

// The left half of Rough // Tumble (see rough-tumble.ts).
export default defineCard({
  name: "Rough",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rough deals 2 damage to each creature without flying.",
  targets: [],
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 2 },
  faces: FACES,
  split: true,
});
