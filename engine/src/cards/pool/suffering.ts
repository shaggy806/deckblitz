import { defineCard } from "../define.js";

// The right half of Pain // Suffering (see pain-suffering.ts).
const FACES = ["Pain // Suffering", "Pain", "Suffering"];

export default defineCard({
  name: "Suffering",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land.",
  targets: ["land"],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
