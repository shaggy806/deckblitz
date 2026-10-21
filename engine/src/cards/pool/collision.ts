import { defineCard } from "../define.js";

const FACES = ["Collision // Colossus", "Collision", "Colossus"];

export default defineCard({
  name: "Collision",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Collision deals 6 damage to target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "damage", amount: 6, target: 0 },
  faces: FACES,
  split: true,
});
