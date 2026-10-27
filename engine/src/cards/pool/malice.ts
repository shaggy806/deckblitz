import { defineCard } from "../define.js";

// The right half of Spite // Malice (see spite-malice.ts).
const FACES = ["Spite // Malice", "Spite", "Malice"];

export default defineCard({
  name: "Malice",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature. It can't be regenerated.",
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
  faces: FACES,
  split: true,
});
