import { defineCard } from "../define.js";

// The left half of Spite // Malice (see spite-malice.ts).
const FACES = ["Spite // Malice", "Spite", "Malice"];

export default defineCard({
  name: "Spite",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target noncreature spell.",
  targets: ["noncreature-spell"],
  effect: { kind: "counter", target: 0 },
  faces: FACES,
  split: true,
});
