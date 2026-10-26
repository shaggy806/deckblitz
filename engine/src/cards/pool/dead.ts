import { defineCard } from "../define.js";

const FACES = ["Dead // Gone", "Dead", "Gone"];

// The left half of Dead // Gone (see dead-gone.ts).
export default defineCard({
  name: "Dead",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Dead deals 2 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 2, target: 0 },
  faces: FACES,
  split: true,
});
