import { defineCard } from "../define.js";

const FACES = ["Rough // Tumble", "Rough", "Tumble"];

// The whole card: every zone but the stack (rule 709.4); rough.ts and
// tumble.ts are the halves.
export default defineCard({
  name: "Rough // Tumble",
  manaCost: "{1}{R}{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rough deals 2 damage to each creature without flying.\n//\nTumble deals 6 damage to each creature with flying.",
  faces: FACES,
  split: true,
});
