import { defineCard } from "../define.js";

const FACES = ["Dead // Gone", "Dead", "Gone"];

// The right half of Dead // Gone (see dead-gone.ts).
export default defineCard({
  name: "Gone",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Return target creature you don't control to its owner's hand.",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "return-to-hand", target: 0 },
  faces: FACES,
  split: true,
});
