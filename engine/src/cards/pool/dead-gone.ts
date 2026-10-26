import { defineCard } from "../define.js";

const FACES = ["Dead // Gone", "Dead", "Gone"];

// The whole card: every zone but the stack (rule 709.4); dead.ts and gone.ts
// are the halves.
export default defineCard({
  name: "Dead // Gone",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Dead deals 2 damage to target creature.\n//\nReturn target creature you don't control to its owner's hand.",
  faces: FACES,
  split: true,
});
