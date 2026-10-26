import { defineCard } from "../define.js";

// The left half of Pure // Simple.
const FACES = ["Pure // Simple", "Pure", "Simple"];

export default defineCard({
  name: "Pure",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Destroy target multicolored permanent.",
  targets: [{ kind: "permanent", filter: { multicolored: true } }],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
