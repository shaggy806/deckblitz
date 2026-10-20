import { defineCard } from "../define.js";

const FACES = ["Fast // Furious", "Fast", "Furious"];
const FURIOUS_TEXT = "Furious deals 3 damage to each creature without flying.";

export default defineCard({
  name: "Furious",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: FURIOUS_TEXT,
  targets: [],
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 3 },
  faces: FACES,
  split: true,
});
